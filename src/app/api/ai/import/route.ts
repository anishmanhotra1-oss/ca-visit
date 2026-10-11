import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import pdfParse from 'pdf-parse';

// Zod Schema for strict AI MCQ output structure
const MCQSchema = z.object({
  topic: z.string().default('General Topic'),
  question_text: z.string(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct_index: z.number().min(0).max(3),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.number().min(1).max(3).default(2),
});

type MCQItem = z.infer<typeof MCQSchema>;

// Helper: Split full document text into clean question chunks without cutting questions
function splitDocumentIntoChunks(text: string, chunkSize = 20000): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex));
      break;
    }

    // Look for a question delimiter in the last 30% of the chunk
    const searchSlice = text.slice(startIndex + Math.floor(chunkSize * 0.7), endIndex);

    // Look for question patterns: \nQ.1, \n1. , \nQuestion 1, \n(1), or \n\n
    const questionMatch = searchSlice.search(
      /\n(?=(?:Q(?:uestion)?\.?\s*\d+|\d{1,3}[\.\)\-]\s+|\(\d{1,3}\)\s+))/i
    );
    const doubleNewlineMatch = searchSlice.lastIndexOf('\n\n');
    const newlineMatch = searchSlice.lastIndexOf('\n');

    let splitOffset = -1;
    if (questionMatch !== -1) {
      splitOffset = Math.floor(chunkSize * 0.7) + questionMatch;
    } else if (doubleNewlineMatch !== -1) {
      splitOffset = Math.floor(chunkSize * 0.7) + doubleNewlineMatch;
    } else if (newlineMatch !== -1) {
      splitOffset = Math.floor(chunkSize * 0.7) + newlineMatch;
    }

    if (splitOffset > 0) {
      endIndex = startIndex + splitOffset;
    }

    chunks.push(text.slice(startIndex, endIndex));
    startIndex = endIndex;
  }

  return chunks;
}

// Helper: Robust JSON extraction & sanitization
function parseAndSanitizeMCQs(responseText: string): MCQItem[] {
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }

  let jsonParsed: any;
  try {
    jsonParsed = JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        jsonParsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Regex JSON array match failed parse:', e);
        return [];
      }
    } else {
      return [];
    }
  }

  if (!Array.isArray(jsonParsed)) return [];

  const results: MCQItem[] = [];
  for (const item of jsonParsed) {
    const parsed = MCQSchema.safeParse(item);
    if (parsed.success) {
      results.push(parsed.data);
    } else if (item && typeof item.question_text === 'string' && item.question_text.trim()) {
      // Recovery fallback for minor schema discrepancies
      const rawOpts = Array.isArray(item.options) ? item.options : [];
      const opts: [string, string, string, string] = [
        String(rawOpts[0] || 'Option A'),
        String(rawOpts[1] || 'Option B'),
        String(rawOpts[2] || 'Option C'),
        String(rawOpts[3] || 'Option D'),
      ];
      const correctIdx =
        typeof item.correct_index === 'number' && item.correct_index >= 0 && item.correct_index <= 3
          ? item.correct_index
          : 0;

      results.push({
        topic: String(item.topic || 'General Topic'),
        question_text: item.question_text.trim(),
        options: opts,
        correct_index: correctIdx,
        explanation: item.explanation ? String(item.explanation) : '',
        tags: Array.isArray(item.tags) ? item.tags.map(String) : ['UPSC'],
        priority: item.priority === 1 || item.priority === 2 || item.priority === 3 ? item.priority : 2,
      });
    }
  }

  return results;
}

// Helper: Run single chunk extraction with candidate fallback models
async function runChunkExtraction(
  genAI: GoogleGenerativeAI,
  candidateModels: string[],
  chunkText: string,
  chunkIdx: number,
  totalChunks: number
): Promise<MCQItem[]> {
  const prompt = `You are a senior UPSC exam expert. Extract ALL multiple-choice questions (MCQs) from this text section into a strict JSON array.
CRITICAL INSTRUCTIONS:
1. Extract EVERY SINGLE question present in this text without skipping, truncating, or summarizing any.
2. For each question, extract:
   - "topic": Topic or subject (e.g. Polity, Economy, Environment, Modern History, Science & Tech, Current Affairs).
   - "question_text": The complete, exact question statement including any multi-statement premises ("1. Statement 1... \\n2. Statement 2...").
   - "options": Exactly 4 options in an array: [Option A, Option B, Option C, Option D].
   - "correct_index": 0 for A, 1 for B, 2 for C, 3 for D. If answer key/explanation is present in the text, use that exact index.
   - "explanation": Complete detailed explanation or solution if provided in text.
   - "tags": Relevant tags like ["UPSC", "Prelims"].
   - "priority": 1 (Hard), 2 (Medium), or 3 (Easy). Default 2.
3. Return ONLY a valid JSON array of objects.

TEXT MATERIAL [Section ${chunkIdx + 1} of ${totalChunks}]:
${chunkText}`;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const mcqs = parseAndSanitizeMCQs(text);
      if (mcqs.length > 0) {
        return mcqs;
      }
    } catch (err: any) {
      console.warn(`[Gemini Chunk ${chunkIdx + 1}] ${modelName} attempt failed:`, err?.message || err);
    }
  }

  return [];
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables.',
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const mode = (formData.get('mode') as string) || 'extract'; // 'extract' | 'generate'
    const rawTextParam = (formData.get('text') as string) || '';
    const file = formData.get('file') as File | null;
    const requestedCount = parseInt((formData.get('count') as string) || '5');
    const targetSubjectName = (formData.get('subjectName') as string) || 'Current Affairs';

    let contentToProcess = rawTextParam;

    // File processing (PDF / Text / CSV / JSON)
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        try {
          const pdfData = await pdfParse(buffer);
          contentToProcess += '\n' + (pdfData.text || '');
        } catch (pdfErr) {
          console.warn('PDF text parse fallback:', pdfErr);
        }
      } else if (
        fileName.endsWith('.txt') ||
        fileName.endsWith('.csv') ||
        fileName.endsWith('.json')
      ) {
        contentToProcess += '\n' + buffer.toString('utf-8');
      }
    }

    if (!contentToProcess.trim()) {
      return NextResponse.json(
        { error: 'No readable text or file content was provided.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash',
      'gemini-3.7-flash',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
    ].filter(Boolean) as string[];

    let questions: MCQItem[] = [];

    if (mode === 'extract') {
      // MULTI-CHUNK COMPLETE EXTRACTION: Do not truncate!
      const chunks = splitDocumentIntoChunks(contentToProcess, 20000);
      console.log(`[AI Import] Extracting all questions from ${chunks.length} chunks (${contentToProcess.length} total chars)...`);

      // Process with concurrency limit of 3
      const concurrency = 3;
      const allExtracted: MCQItem[] = [];

      for (let i = 0; i < chunks.length; i += concurrency) {
        const slice = chunks.slice(i, i + concurrency);
        const batchPromises = slice.map((chunk, offset) =>
          runChunkExtraction(genAI, candidateModels, chunk, i + offset, chunks.length)
        );
        const batchResults = await Promise.all(batchPromises);
        for (const res of batchResults) {
          allExtracted.push(...res);
        }
      }

      // Deduplicate questions by normalized question text
      const seenHashes = new Set<string>();
      for (const q of allExtracted) {
        const hash = q.question_text.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (hash.length > 10 && seenHashes.has(hash)) {
          continue;
        }
        if (hash.length > 10) seenHashes.add(hash);
        questions.push(q);
      }

      if (questions.length === 0) {
        throw new Error('No multiple-choice questions could be detected in the uploaded document.');
      }
    } else {
      // GENERATION MODE: generate requestedCount questions from notes
      const prompt = `You are a senior UPSC exam paper setter. Generate exactly ${requestedCount} high-quality, authentic UPSC-style multiple choice questions based on the following study material/article.
Target Subject: "${targetSubjectName}".
Include multi-statement questions ("Consider the following statements...", "Which of the pairs given above is/are correctly matched?").

STUDY MATERIAL:
${contentToProcess.slice(0, 35000)}

STRICT JSON ARRAY FORMAT ONLY:
[
  {
    "topic": "Specific Topic",
    "question_text": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Detailed step-by-step reasoning...",
    "tags": ["UPSC", "${targetSubjectName}"],
    "priority": 2
  }
]`;

      let responseText = '';
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
            },
          });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          if (responseText) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Gen] ${modelName} attempt failed:`, err?.message || err);
        }
      }

      if (!responseText) {
        throw lastError || new Error('Failed to generate response from Gemini AI models.');
      }

      questions = parseAndSanitizeMCQs(responseText);
    }

    return NextResponse.json({
      success: true,
      mode,
      extractedCount: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('Gemini Import API Error:', err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          'Failed to process file with AI. Please check your text or file format.',
      },
      { status: 500 }
    );
  }
}
