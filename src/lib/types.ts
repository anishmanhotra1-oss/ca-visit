export type PriorityLevel = 1 | 2 | 3; // 1: High, 2: Mid, 3: Low
export type DifficultyLevel = 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
export type AttemptStatus = 'correct' | 'incorrect' | 'skipped';
export type SessionKind = 'quiz' | 'smart';
export type SessionMode = 'practice' | 'exam';
export type ImportStatus = 'uploaded' | 'parsing' | 'review' | 'done' | 'failed';

export interface Subject {
  id: string;
  user_id: string | null; // null for built-in system subjects
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  user_id: string;
  subject_id: string;
  topic: string;
  question_text: string;
  options: [string, string, string, string]; // exactly 4 options
  correct_index: number; // 0..3
  explanation?: string;
  tags?: string[];
  source?: string;
  source_date?: string;
  difficulty?: DifficultyLevel;
  priority: PriorityLevel; // default 2
  import_id?: string | null;
  content_hash?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionState {
  user_id: string;
  question_id: string;
  last_status: AttemptStatus | null;
  last_attempt_at: string | null;
  times_seen: number;
  times_wrong: number;
  times_correct: number;
  streak: number;
  in_mistakes: boolean;
}

export interface Attempt {
  id: string;
  user_id: string;
  question_id: string;
  session_id?: string | null;
  selected_index?: number | null;
  status: AttemptStatus;
  time_spent_sec: number;
  answered_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  kind: SessionKind;
  mode: SessionMode;
  subject_ids: string[];
  question_count: number;
  started_at: string;
  finished_at?: string | null;
  score?: number | null;
  correct: number;
  incorrect: number;
  skipped: number;
  time_taken_sec: number;
}

export interface Bookmark {
  user_id: string;
  question_id: string;
  created_at: string;
}

export interface ImportRecord {
  id: string;
  user_id: string;
  filename: string;
  storage_path?: string | null;
  kind: string;
  status: ImportStatus;
  question_count: number;
  created_at: string;
}

export interface AspirantProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  password_hash?: string;
  target_year: number;
  optional_subject: string;
  phone?: string;
  created_at?: string;
}

// Built-in fixed subjects list
export const BUILTIN_SUBJECTS: Omit<Subject, 'id' | 'created_at'>[] = [
  { user_id: null, name: 'Economy', code: 'ECO' },
  { user_id: null, name: 'Current Affairs', code: 'CA' },
  { user_id: null, name: 'Modern History', code: 'MH' },
  { user_id: null, name: 'Ancient Medieval Art & Culture', code: 'AC' },
  { user_id: null, name: 'International Relations', code: 'IR' },
  { user_id: null, name: 'Geography', code: 'GEO' },
  { user_id: null, name: 'Environment', code: 'ENV' },
  { user_id: null, name: 'Science and Technology', code: 'ST' },
  { user_id: null, name: 'Polity', code: 'POL' },
  { user_id: null, name: 'Miscellaneous', code: 'MISC' },
];
