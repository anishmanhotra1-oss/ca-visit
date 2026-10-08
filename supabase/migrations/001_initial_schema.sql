-- Migration: 001_initial_schema.sql
-- Description: Complete Postgres Schema, Triggers, RLS, & Built-in Subjects Seed for CA-VISIT

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system built-in subjects
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 strings [optionA, optionB, optionC, optionD]
    correct_index INT NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
    explanation TEXT,
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    source_date DATE,
    difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 3),
    priority SMALLINT DEFAULT 2 CHECK (priority BETWEEN 1 AND 3), -- 1: High, 2: Mid, 3: Low
    import_id UUID,
    content_hash TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('quiz', 'smart')),
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
    subject_ids UUID[] DEFAULT '{}',
    question_count INT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    score NUMERIC(6, 2),
    correct INT DEFAULT 0,
    incorrect INT DEFAULT 0,
    skipped INT DEFAULT 0,
    time_taken_sec INT DEFAULT 0
);

-- 4. ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    selected_index INT,
    status TEXT NOT NULL CHECK (status IN ('correct', 'incorrect', 'skipped')),
    time_spent_sec INT DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTION STATE TABLE (Tracks unseen, mistakes, streak, heatmap status per question)
CREATE TABLE IF NOT EXISTS public.question_state (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    last_status TEXT CHECK (last_status IN ('correct', 'incorrect', 'skipped')),
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    times_seen INT DEFAULT 0,
    times_wrong INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    streak INT DEFAULT 0,
    in_mistakes BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, question_id)
);

-- 6. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, question_id)
);

-- 7. IMPORTS TABLE
CREATE TABLE IF NOT EXISTS public.imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT,
    kind TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('uploaded', 'parsing', 'review', 'done', 'failed')),
    question_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_questions_user_subject ON public.questions(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_topic ON public.questions(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_questions_deleted ON public.questions(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_question_state_mistakes ON public.question_state(user_id, in_mistakes);
CREATE INDEX IF NOT EXISTS idx_attempts_user_question ON public.attempts(user_id, question_id);

-- TRIGGER FUNCTION FOR AUTOMATIC QUESTION STATE UPDATES
CREATE OR REPLACE FUNCTION public.handle_attempt_update()
RETURNS TRIGGER AS $$
DECLARE
    sess_kind TEXT;
BEGIN
    -- Retrieve session kind if available
    IF NEW.session_id IS NOT NULL THEN
        SELECT kind INTO sess_kind FROM public.sessions WHERE id = NEW.session_id;
    END IF;

    INSERT INTO public.question_state (
        user_id,
        question_id,
        last_status,
        last_attempt_at,
        times_seen,
        times_wrong,
        times_correct,
        streak,
        in_mistakes
    )
    VALUES (
        NEW.user_id,
        NEW.question_id,
        NEW.status,
        NEW.answered_at,
        1,
        CASE WHEN NEW.status IN ('incorrect', 'skipped') THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'correct' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'correct' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status IN ('incorrect', 'skipped') THEN TRUE ELSE FALSE END
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        last_status = EXCLUDED.last_status,
        last_attempt_at = EXCLUDED.last_attempt_at,
        times_seen = public.question_state.times_seen + 1,
        times_wrong = public.question_state.times_wrong + (CASE WHEN EXCLUDED.last_status IN ('incorrect', 'skipped') THEN 1 ELSE 0 END),
        times_correct = public.question_state.times_correct + (CASE WHEN EXCLUDED.last_status = 'correct' THEN 1 ELSE 0 END),
        streak = CASE WHEN EXCLUDED.last_status = 'correct' THEN public.question_state.streak + 1 ELSE 0 END,
        -- Mistake Removal Rule: Removed from mistake notebook ONLY when answered correctly in a SMART quiz
        in_mistakes = CASE 
            WHEN EXCLUDED.last_status IN ('incorrect', 'skipped') THEN TRUE
            WHEN EXCLUDED.last_status = 'correct' AND sess_kind = 'smart' THEN FALSE
            ELSE public.question_state.in_mistakes
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER ON ATTEMPTS TABLE
DROP TRIGGER IF EXISTS trigger_handle_attempt ON public.attempts;
CREATE TRIGGER trigger_handle_attempt
    AFTER INSERT ON public.attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_attempt_update();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;

-- Subjects RLS: Read system subjects OR user custom subjects
CREATE POLICY "Subjects read access" ON public.subjects
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Subjects insert access" ON public.subjects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Subjects update/delete access" ON public.subjects
    FOR ALL USING (user_id = auth.uid());

-- Questions RLS
CREATE POLICY "Questions isolation" ON public.questions
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Sessions RLS
CREATE POLICY "Sessions isolation" ON public.sessions
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Attempts RLS
CREATE POLICY "Attempts isolation" ON public.attempts
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Question State RLS
CREATE POLICY "Question State isolation" ON public.question_state
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Bookmarks RLS
CREATE POLICY "Bookmarks isolation" ON public.bookmarks
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Imports RLS
CREATE POLICY "Imports isolation" ON public.imports
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SEED FIXED SYSTEM SUBJECTS
INSERT INTO public.subjects (user_id, name, code) VALUES
    (NULL, 'Economy', 'ECO'),
    (NULL, 'Current Affairs', 'CA'),
    (NULL, 'Modern History', 'MH'),
    (NULL, 'Ancient Medieval Art & Culture', 'AC'),
    (NULL, 'International Relations', 'IR'),
    (NULL, 'Geography', 'GEO'),
    (NULL, 'Environment', 'ENV'),
    (NULL, 'Science and Technology', 'ST'),
    (NULL, 'Polity', 'POL'),
    (NULL, 'Miscellaneous', 'MISC')
ON CONFLICT DO NOTHING;
