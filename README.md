# CA-VISIT | Personal UPSC Quiz & Mistake Revision PWA

**CA-VISIT** is a personal, production-grade quiz, mistake revision, and AI material extraction web application built for UPSC and competitive exam preparation.

---

## 🌟 Key Features

1. **Private Question Bank**: Every question added is isolated and strictly private (`auth.uid() = user_id`).
2. **UPSC Scoring & Session Modes**:
   - UPSC Marking Scheme ($+2$ for correct, $-0.67$ for incorrect, $0$ for skipped).
   - **Practice Mode**: Option locking, immediate correct/wrong highlights, and detailed solution explanations.
   - **Exam Mode**: Full test environment with palette navigation, answer changing, optional countdown timer, and reveal-on-submit.
3. **Personal Mistakes Notebook & Smart Quiz**:
   - Questions answered incorrectly automatically enter the **Mistakes Notebook**.
   - **Strict Rule Enforcement**: A mistake is removed from the notebook **ONLY** when answered correctly in a **Smart Quiz**!
   - Smart Quiz ordering prioritizes high-priority questions ($P1 \rightarrow P2 \rightarrow P3$), most recently wrong questions, and highest error counts.
4. **AI Bulk Import & Material Generator**:
   - Upload `.pdf`, `.docx`, `.txt`, `.csv`, `.json`, or image files (`.png`, `.jpg`).
   - Server-side Gemini AI route handler (`/api/ai/import`) extracts structured MCQs or generates fresh questions from notes.
   - Review & Approval screen with duplicate detection (normalized text hashing).
5. **Memory Heatmap & Focus Next**:
   - Visual topic strength matrix: Strong ($\ge 70\%$), Average ($50-69\%$), Weak ($<50\%$), and Low attempts ($<3$).
   - One-tap **Focus Next** smart quiz links for top weak topics.
6. **Offline Execution & 30-Day Trash**:
   - Active quizzes cached in LocalStorage/IndexedDB for offline execution.
   - Soft-deletion into a 30-Day Trash bin with instant restoration.
   - Full JSON/CSV backup data export and import.

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- Node.js `18.x` or `20.x`
- npm or pnpm

### 2. Environment Variables Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your server-side Gemini API key and Supabase details:
```env
# Supabase Cloud Setup (Optional: LocalStorage fallback operates automatically)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI API Key (Required for PDF & Notes MCQ Generation)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Database Migration (Supabase Postgres)
Run the SQL script located at [supabase/migrations/001_initial_schema.sql](file:///d:/CURRENT%20AFFAIRS/supabase/migrations/001_initial_schema.sql) in your Supabase SQL Editor:
- Creates `subjects`, `questions`, `sessions`, `attempts`, `question_state`, `bookmarks`, and `imports` tables.
- Sets up Row Level Security (RLS) policies.
- Enables automatic trigger `handle_attempt_update` for tracking streak and mistake notebook rules.
- Seeds 10 built-in UPSC subjects (`ECO`, `CA`, `MH`, `AC`, `IR`, `GEO`, `ENV`, `ST`, `POL`, `MISC`).

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack & Design System

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom **White & Burgundy** exam-focused palette (`#7A1F3D` primary, `#FAF6F5` background, `#190D11` dark mode).
- **Icons & UI**: Lucide Icons, Playfair Display serif headings + Inter body font.
- **AI Backend**: Gemini API (`@google/genai` / `@google/generative-ai`) via Next.js server route handler.
- **Offline & Cache**: LocalStorage + IndexedDB quiz engine with Supabase Realtime sync capability.
- **PWA**: Installable web manifest (`/manifest.json`).

---

## 🔒 Security & Data Privacy

- All AI endpoints run strictly server-side (`GEMINI_API_KEY` is never exposed to client bundles).
- Row Level Security (RLS) enforces tenant isolation (`auth.uid() = user_id`).
- Questions are never auto-deleted. Deletion only occurs via explicit user confirmation.
