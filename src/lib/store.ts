'use client';

import {
  Question,
  QuestionState,
  Attempt,
  Session,
  Subject,
  Bookmark,
  ImportRecord,
  SessionKind,
  SessionMode,
  AttemptStatus,
  AspirantProfile,
} from './types';
import { INITIAL_SUBJECTS, SAMPLE_QUESTIONS } from './sampleQuestions';

const DEFAULT_USER_ID = 'usr-local-default';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  negativeMarking: boolean; // default true (-0.67)
  negativeValue: number; // default 0.67
  defaultQuizLength: number; // default 10
  defaultMode: SessionMode; // default 'practice'
  theme: 'light' | 'dark' | 'system';
}

const STORAGE_KEYS = {
  USER: 'cav_user_profile',
  ASPIRANTS: 'cav_aspirant_profiles',
  CURRENT_ASPIRANT: 'cav_current_aspirant',
  SUBJECTS: 'cav_subjects',
  QUESTIONS: 'cav_questions',
  STATES: 'cav_question_states',
  ATTEMPTS: 'cav_attempts',
  SESSIONS: 'cav_sessions',
  BOOKMARKS: 'cav_bookmarks',
  IMPORTS: 'cav_imports',
};

// Helper: load or initialize local storage
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`LocalStorage write error for ${key}:`, err);
  }
}

export class LocalAppStore {
  // 1. USER AUTH / PROFILE & ASPIRANTS DB
  static getAspirantProfiles(): AspirantProfile[] {
    const raw = getItem<AspirantProfile[]>(STORAGE_KEYS.ASPIRANTS, []);
    return Array.isArray(raw) ? raw : [];
  }

  static getCurrentAspirant(): AspirantProfile | null {
    const raw = getItem<AspirantProfile | null>(STORAGE_KEYS.CURRENT_ASPIRANT, null);
    if (raw && raw.email) return raw;
    return null;
  }

  static setCurrentAspirant(profile: AspirantProfile | null): void {
    setItem(STORAGE_KEYS.CURRENT_ASPIRANT, profile);
    if (profile) {
      this.updateUser({
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
      });
    }
  }

  static registerAspirant(data: {
    full_name: string;
    email: string;
    password_hash: string;
    target_year: number;
    optional_subject: string;
    phone?: string;
  }): AspirantProfile {
    const profiles = this.getAspirantProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newProfile: AspirantProfile = {
      id: `asp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      full_name: data.full_name,
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      target_year: data.target_year || 2026,
      optional_subject: data.optional_subject || 'PSIR',
      phone: data.phone || '',
      created_at: new Date().toISOString(),
    };

    profiles.push(newProfile);
    setItem(STORAGE_KEYS.ASPIRANTS, profiles);
    this.setCurrentAspirant(newProfile);
    return newProfile;
  }

  static loginAspirant(email: string, password_hash: string): AspirantProfile | null {
    const profiles = this.getAspirantProfiles();
    const profile = profiles.find(
      (p) =>
        p.email.toLowerCase() === email.toLowerCase() &&
        (p.password_hash === password_hash || !p.password_hash)
    );

    if (!profile) {
      return null;
    }

    this.setCurrentAspirant(profile);
    return profile;
  }

  static logoutAspirant(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ASPIRANT);
      } catch (e) {
        // ignore
      }
    }
    setItem(STORAGE_KEYS.CURRENT_ASPIRANT, null);
  }

  static getUser(): UserProfile {
    const aspirant = getItem<AspirantProfile | null>(STORAGE_KEYS.CURRENT_ASPIRANT, null);
    const storedUser = getItem<UserProfile>(STORAGE_KEYS.USER, {
      id: DEFAULT_USER_ID,
      email: 'aspirant@upsc-visit.local',
      name: 'UPSC Aspirant',
      negativeMarking: true,
      negativeValue: 0.67,
      defaultQuizLength: 10,
      defaultMode: 'practice',
      theme: 'light',
    });

    if (aspirant) {
      return {
        ...storedUser,
        id: aspirant.id,
        name: aspirant.full_name || storedUser.name,
        email: aspirant.email || storedUser.email,
      };
    }

    return storedUser;
  }

  static updateUser(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const updated = { ...current, ...updates };
    setItem(STORAGE_KEYS.USER, updated);
    return updated;
  }

  // 2. SUBJECTS
  static getSubjects(): Subject[] {
    const stored = getItem<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
    if (!Array.isArray(stored) || stored.length === 0) {
      setItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
      return INITIAL_SUBJECTS;
    }
    return stored;
  }

  static addSubject(name: string, code: string): Subject {
    const subjects = this.getSubjects();
    const user = this.getUser();
    const newSubject: Subject = {
      id: `sub-custom-${Date.now()}`,
      user_id: user.id,
      name,
      code: code.toUpperCase(),
      created_at: new Date().toISOString(),
    };
    const updated = [...subjects, newSubject];
    setItem(STORAGE_KEYS.SUBJECTS, updated);
    return newSubject;
  }

  // 3. QUESTIONS
  static getQuestions(includeDeleted = false): Question[] {
    const user = this.getUser();
    const stored = getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    if (!Array.isArray(stored) || stored.length === 0) {
      // Seed sample questions attached to default user
      const seeded: Question[] = SAMPLE_QUESTIONS.map((q) => ({
        ...q,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }));
      setItem(STORAGE_KEYS.QUESTIONS, seeded);
      return includeDeleted ? seeded : seeded.filter((q) => !q.deleted_at);
    }
    const userQuestions = stored.filter((q) => q && q.user_id === user.id);
    return includeDeleted
      ? userQuestions
      : userQuestions.filter((q) => q && !q.deleted_at);
  }

  static getQuestionById(id: string): Question | undefined {
    return this.getQuestions(true).find((q) => q.id === id);
  }

  static addQuestion(
    q: Omit<Question, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Question {
    const questions = getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const user = this.getUser();
    const newQ: Question = {
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      priority: q.priority || 2,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    questions.push(newQ);
    setItem(STORAGE_KEYS.QUESTIONS, questions);
    return newQ;
  }

  static updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const questions = getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    questions[idx] = {
      ...questions[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.QUESTIONS, questions);
    return questions[idx];
  }

  static softDeleteQuestion(id: string): void {
    this.updateQuestion(id, { deleted_at: new Date().toISOString() });
  }

  static restoreQuestion(id: string): void {
    this.updateQuestion(id, { deleted_at: null });
  }

  static permanentDeleteQuestion(id: string): void {
    const questions = getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const filtered = questions.filter((q) => q.id !== id);
    setItem(STORAGE_KEYS.QUESTIONS, filtered);
  }

  static bulkMoveSubject(questionIds: string[], targetSubjectId: string): void {
    const questions = getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const updated = questions.map((q) =>
      questionIds.includes(q.id)
        ? { ...q, subject_id: targetSubjectId, updated_at: new Date().toISOString() }
        : q
    );
    setItem(STORAGE_KEYS.QUESTIONS, updated);
  }

  static bulkSoftDelete(questionIds: string[]): void {
    const now = new Date().toISOString();
    const questions = getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const updated = questions.map((q) =>
      questionIds.includes(q.id) ? { ...q, deleted_at: now } : q
    );
    setItem(STORAGE_KEYS.QUESTIONS, updated);
  }

  // 4. QUESTION STATE & ATTEMPTS
  static getQuestionStates(): Record<string, QuestionState> {
    const raw = getItem<Record<string, QuestionState>>(STORAGE_KEYS.STATES, {});
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  }

  static getQuestionState(questionId: string): QuestionState {
    const user = this.getUser();
    const states = this.getQuestionStates();
    return (
      states[questionId] || {
        user_id: user.id,
        question_id: questionId,
        last_status: null,
        last_attempt_at: null,
        times_seen: 0,
        times_wrong: 0,
        times_correct: 0,
        streak: 0,
        in_mistakes: false,
      }
    );
  }

  static recordAttempt(
    questionId: string,
    sessionId: string | null,
    selectedIndex: number | null,
    status: AttemptStatus,
    timeSpentSec: number,
    sessionKind?: SessionKind
  ): { attempt: Attempt; state: QuestionState } {
    const user = this.getUser();
    const attempts = getItem<Attempt[]>(STORAGE_KEYS.ATTEMPTS, []);
    const now = new Date().toISOString();

    const newAttempt: Attempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      question_id: questionId,
      session_id: sessionId,
      selected_index: selectedIndex,
      status,
      time_spent_sec: timeSpentSec,
      answered_at: now,
    };
    attempts.push(newAttempt);
    setItem(STORAGE_KEYS.ATTEMPTS, attempts);

    // Update question state
    const states = this.getQuestionStates();
    const currentState = this.getQuestionState(questionId);

    const isCorrect = status === 'correct';
    const isIncorrectOrSkipped = status === 'incorrect' || status === 'skipped';

    // Mistake Rule: Mistake is removed ONLY when answered correctly in a SMART quiz
    let updatedInMistakes = currentState.in_mistakes;
    if (isIncorrectOrSkipped) {
      updatedInMistakes = true;
    } else if (isCorrect && sessionKind === 'smart') {
      updatedInMistakes = false;
    }

    const newState: QuestionState = {
      user_id: user.id,
      question_id: questionId,
      last_status: status,
      last_attempt_at: now,
      times_seen: currentState.times_seen + 1,
      times_wrong: currentState.times_wrong + (isIncorrectOrSkipped ? 1 : 0),
      times_correct: currentState.times_correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? currentState.streak + 1 : 0,
      in_mistakes: updatedInMistakes,
    };

    states[questionId] = newState;
    setItem(STORAGE_KEYS.STATES, states);

    return { attempt: newAttempt, state: newState };
  }

  // 5. BOOKMARKS
  static getBookmarks(): Bookmark[] {
    const user = this.getUser();
    const stored = getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter((b) => b && b.user_id === user.id);
  }

  static toggleBookmark(questionId: string): boolean {
    const user = this.getUser();
    const bookmarks = getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    const list = Array.isArray(bookmarks) ? bookmarks : [];
    const index = list.findIndex(
      (b) => b && b.user_id === user.id && b.question_id === questionId
    );
    if (index >= 0) {
      list.splice(index, 1);
      setItem(STORAGE_KEYS.BOOKMARKS, list);
      return false; // removed
    } else {
      list.push({
        user_id: user.id,
        question_id: questionId,
        created_at: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.BOOKMARKS, list);
      return true; // added
    }
  }

  static isBookmarked(questionId: string): boolean {
    const user = this.getUser();
    const bookmarks = getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    if (!Array.isArray(bookmarks)) return false;
    return bookmarks.some(
      (b) => b && b.user_id === user.id && b.question_id === questionId
    );
  }

  // 6. QUIZ SELECTION ALGORITHMS
  static selectQuizQuestions(options: {
    subjectIds?: string[];
    count: number;
    unseenOnly?: boolean;
    topicFilter?: string;
  }): Question[] {
    const allQuestions = this.getQuestions();
    const states = this.getQuestionStates();

    let pool = allQuestions;

    if (options.subjectIds && options.subjectIds.length > 0) {
      pool = pool.filter((q) => options.subjectIds!.includes(q.subject_id));
    }

    if (options.topicFilter) {
      pool = pool.filter(
        (q) => q.topic.toLowerCase() === options.topicFilter!.toLowerCase()
      );
    }

    if (options.unseenOnly) {
      pool = pool.filter((q) => {
        const st = states[q.id];
        return !st || st.times_seen === 0;
      });
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, options.count);
  }

  static selectSmartQuizQuestions(options: {
    subjectIds?: string[];
    count: number;
    topicFilter?: string;
  }): Question[] {
    const allQuestions = this.getQuestions();
    const states = this.getQuestionStates();

    // Smart quiz targets questions where in_mistakes is true OR last_status is incorrect/skipped
    let pool = allQuestions.filter((q) => {
      const st = states[q.id];
      return st && st.in_mistakes;
    });

    if (options.subjectIds && options.subjectIds.length > 0) {
      pool = pool.filter((q) => options.subjectIds!.includes(q.subject_id));
    }

    if (options.topicFilter) {
      pool = pool.filter(
        (q) => q.topic.toLowerCase() === options.topicFilter!.toLowerCase()
      );
    }

    // Smart quiz ordering: High priority (1) -> Mid (2) -> Low (3),
    // then most recently wrong, then times_wrong descending.
    pool.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const stA = states[a.id];
      const stB = states[b.id];
      const timeA = stA?.last_attempt_at ? new Date(stA.last_attempt_at).getTime() : 0;
      const timeB = stB?.last_attempt_at ? new Date(stB.last_attempt_at).getTime() : 0;

      if (timeB !== timeA) {
        return timeB - timeA; // Most recently attempted/wrong first
      }

      const wrongA = stA?.times_wrong || 0;
      const wrongB = stB?.times_wrong || 0;
      return wrongB - wrongA;
    });

    return pool.slice(0, options.count);
  }

  // 7. SESSIONS
  static getSessions(): Session[] {
    const user = this.getUser();
    const stored = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter((s) => s && s.user_id === user.id);
  }

  static saveSession(session: Omit<Session, 'id' | 'user_id'>): Session {
    const user = this.getUser();
    const rawSessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
    const sessions = Array.isArray(rawSessions) ? rawSessions : [];
    const newSession: Session = {
      ...session,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
    };
    sessions.push(newSession);
    setItem(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  }

  // 8. IMPORTS LOG
  static getImports(): ImportRecord[] {
    const user = this.getUser();
    const stored = getItem<ImportRecord[]>(STORAGE_KEYS.IMPORTS, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter((imp) => imp && imp.user_id === user.id);
  }

  static addImportRecord(filename: string, kind: string, count: number): ImportRecord {
    const user = this.getUser();
    const imports = getItem<ImportRecord[]>(STORAGE_KEYS.IMPORTS, []);
    const newImp: ImportRecord = {
      id: `imp-${Date.now()}`,
      user_id: user.id,
      filename,
      kind,
      status: 'done',
      question_count: count,
      created_at: new Date().toISOString(),
    };
    imports.push(newImp);
    setItem(STORAGE_KEYS.IMPORTS, imports);
    return newImp;
  }

  // 9. EXPORT & DATA BACKUP
  static exportAllData(): string {
    const payload = {
      user: this.getUser(),
      subjects: this.getSubjects(),
      questions: getItem<Question[]>(STORAGE_KEYS.QUESTIONS, []),
      states: this.getQuestionStates(),
      attempts: getItem<Attempt[]>(STORAGE_KEYS.ATTEMPTS, []),
      sessions: this.getSessions(),
      bookmarks: this.getBookmarks(),
      imports: this.getImports(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }

  static importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.questions && Array.isArray(data.questions)) {
        setItem(STORAGE_KEYS.QUESTIONS, data.questions);
      }
      if (data.subjects && Array.isArray(data.subjects)) {
        setItem(STORAGE_KEYS.SUBJECTS, data.subjects);
      }
      if (data.states) {
        setItem(STORAGE_KEYS.STATES, data.states);
      }
      if (data.attempts && Array.isArray(data.attempts)) {
        setItem(STORAGE_KEYS.ATTEMPTS, data.attempts);
      }
      if (data.sessions && Array.isArray(data.sessions)) {
        setItem(STORAGE_KEYS.SESSIONS, data.sessions);
      }
      if (data.bookmarks && Array.isArray(data.bookmarks)) {
        setItem(STORAGE_KEYS.BOOKMARKS, data.bookmarks);
      }
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }
}
