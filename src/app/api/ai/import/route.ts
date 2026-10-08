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

const MCQListSchema = z.array(MCQSchema);

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
          contentToProcess += '\n' + pdfData.text;
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    let prompt = '';
    if (mode === 'extract') {
      prompt = `You are a senior UPSC exam expert. Extract all multiple-choice questions (MCQs) from the following text into strict JSON format.
Preserve exact question wording, statement line breaks, 4 options, correct answer index (0 for A, 1 for B, 2 for C, 3 for D), and detailed explanation if provided.

TEXT MATERIAL:
${contentToProcess.slice(0, 15000)}

STRICT JSON ARRAY FORMAT ONLY:
[
  {
    "topic": "Topic Name",
    "question_text": "Question statement...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Explanation why Option A is correct...",
    "tags": ["Tag1", "Tag2"],
    "priority": 2
  }
]`;
    } else {
      prompt = `You are a senior UPSC exam paper setter. Generate exactly ${requestedCount} high-quality, authentic UPSC-style multiple choice questions based on the following study material/article.
Target Subject: "${targetSubjectName}".
Include multi-statement questions ("Consider the following statements...", "Which of the pairs given above is/are correctly matched?").

STUDY MATERIAL:
${contentToProcess.slice(0, 15000)}

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
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let jsonParsed;
    try {
      jsonParsed = JSON.parse(responseText);
    } catch (parseErr) {
      // Fallback clean markdown code block wrapped JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonParsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI output did not contain a valid JSON array.');
      }
    }

    const validated = MCQListSchema.parse(jsonParsed);

    return NextResponse.json({
      success: true,
      mode,
      extractedCount: validated.length,
      questions: validated,
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
