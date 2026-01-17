/**
 * AI Service Entry Point
 * Main export for QuizGen, Grading, and Privacy Guard services
 */

export { LLMService } from './services/llm.service.js';
export { QuizGenEngine } from './engines/quiz-gen.engine.js';
export { GradingEngine } from './engines/grading.engine.js';
export { privacyGuard, sanitizePII, validateNoPII } from './middleware/privacy-guard.js';

// Re-export types
export type {
  LLMProvider,
  LLMConfig,
  MultipleChoiceQuestion,
  QuizGenResult,
  GradingResult,
  Rubric,
  RubricCriterion,
  StudentAnswer,
  SanitizedContent,
} from './types/ai.js';

export type { QuizGenOptions } from './engines/quiz-gen.engine.js';
export type { GradingOptions } from './engines/grading.engine.js';

// Default configuration
export { DEFAULT_LLM_CONFIG } from './config/ai.config.js';
