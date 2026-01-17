/**
 * Express API Server
 * Serves API endpoints for the K-5 LMS, including QuizGen Engine integration
 * 
 * Run with: npm run dev (uses tsx for TypeScript support)
 * Or build server folder first: cd server && npm run build
 */

import express from 'express';
import cors from 'cors';
// Import QuizGen Engine - ensure server folder is built first (cd server && npm run build)
// Or use tsx to run TypeScript directly: npm run dev:ts
import { QuizGenEngine } from '../server/src/index.js';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Supabase client initialized');
} else {
  console.warn('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/generate-quiz
 * Generate quiz from curriculum text using QuizGen Engine
 */
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const {
      curriculumText,
      gradeLevel,
      subject,
      curriculumStandard,
      numberOfQuestions = 5,
      difficulty = 'medium',
      teacherId, // Optional: teacher ID to associate quiz with
      title, // Optional: quiz title
    } = req.body;

    // Validate required fields
    if (!curriculumText || !gradeLevel || !subject) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['curriculumText', 'gradeLevel', 'subject'],
      });
    }

    // Initialize QuizGen Engine
    const quizEngine = new QuizGenEngine();

    // Generate quiz
    const quizResult = await quizEngine.generateQuiz(curriculumText, {
      gradeLevel,
      subject,
      curriculumStandard,
      numberOfQuestions,
      difficulty,
    });

    // Save quiz to database if Supabase is configured and teacherId provided
    let savedQuiz = null;
    if (supabase && teacherId) {
      try {
        const assignmentData = {
          teacher_id: teacherId,
          title: title || `Quiz: ${subjectLabels[subject] || subject} - ${gradeLabels[gradeLevel] || gradeLevel}`,
          description: `AI-generated quiz from curriculum text. Standard: ${curriculumStandard || 'N/A'}`,
          task_type: 'quiz',
          subject_area: subject,
          grade_level: gradeLevel,
          curriculum_standard: curriculumStandard || null,
          total_points: 100,
          assigned_at: new Date().toISOString(),
          is_active: true,
          settings: {
            questions: quizResult.questions,
            difficulty,
            numberOfQuestions: quizResult.questions.length,
          },
        };

        const { data, error } = await supabase
          .from('assignments')
          .insert(assignmentData)
          .select()
          .single();

        if (error) {
          console.error('Error saving quiz to database:', error);
          // Continue anyway - quiz generation succeeded
        } else {
          savedQuiz = data;
          console.log('Quiz saved to database:', data.id);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue anyway - quiz generation succeeded
      }
    }

    // Return quiz result
    res.json({
      success: true,
      quiz: quizResult,
      assignment: savedQuiz,
      metadata: {
        generatedAt: new Date().toISOString(),
        curriculumLength: curriculumText.length,
        questionsGenerated: quizResult.questions.length,
      },
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      error: 'Failed to generate quiz',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper mappings (should match frontend)
const gradeLabels = {
  kindergarten: 'Kindergarten',
  grade_1: 'Grade 1',
  grade_2: 'Grade 2',
  grade_3: 'Grade 3',
  grade_4: 'Grade 4',
  grade_5: 'Grade 5',
};

const subjectLabels = {
  math: 'Math',
  reading: 'Reading',
  science: 'Science',
  social_studies: 'Social Studies',
  language_arts: 'Language Arts',
  art: 'Art',
  music: 'Music',
  physical_education: 'Physical Education',
};

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
