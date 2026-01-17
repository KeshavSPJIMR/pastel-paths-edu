/**
 * Type definitions for AI service components
 */

export type LLMProvider = 'ollama' | 'api';

export interface LLMConfig {
  provider: LLMProvider;
  model?: string; // e.g., 'phi3:mini', 'llama2', etc.
  baseUrl?: string; // For Ollama: 'http://localhost:11434' or custom API endpoint
  apiKey?: string; // For external APIs
  temperature?: number;
  maxTokens?: number;
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[]; // 4 options typically
  correctAnswer: number; // Index of correct option (0-based)
  explanation?: string;
}

export interface QuizGenResult {
  questions: MultipleChoiceQuestion[];
  metadata: {
    gradeLevel: string;
    subject: string;
    curriculumStandard?: string;
    generatedAt: string;
  };
}

export interface GradingResult {
  score: number; // 0-100 or points-based
  maxScore: number;
  gradePercentage: number; // 0-100
  encouragingFeedback: string; // For student
  instructionalInsight: string; // For teacher
  strengths?: string[];
  areasForImprovement?: string[];
  rubricAlignment?: {
    criterion: string;
    score: number;
    maxScore: number;
    notes: string;
  }[];
}

export interface Rubric {
  totalPoints: number;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
  weight?: number; // Optional weight for weighted grading
  evaluationCriteria?: string[]; // What to look for
}

export interface StudentAnswer {
  content: string | Record<string, any>; // Can be text or structured JSON
  assignmentId?: string;
  questionId?: string;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  config?: Partial<LLMConfig>;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface SanitizedContent {
  sanitized: string;
  removedFields: string[]; // Track what PII was removed for logging
}
