-- Migration: 002_aspirant_profiles.sql
-- Description: Aspirant Profiles Table for User Signup, Login & Target Year / Optional Subject storage

CREATE TABLE IF NOT EXISTS public.aspirant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- Stored hashed password for local authentication fallback
    target_year INT DEFAULT 2026,
    optional_subject TEXT DEFAULT 'PSIR',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES FOR ASPIRANT PROFILES
ALTER TABLE public.aspirant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aspirants self select" ON public.aspirant_profiles
    FOR SELECT USING (user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Aspirants self insert" ON public.aspirant_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Aspirants self update" ON public.aspirant_profiles
    FOR ALL USING (user_id = auth.uid() OR id = auth.uid());
