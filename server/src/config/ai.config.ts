/**
 * AI Service Configuration
 */

import type { LLMConfig } from '../types/ai.js';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: (process.env.LLM_PROVIDER as 'ollama' | 'api') || 'ollama',
  model: process.env.LLM_MODEL || 'phi3:mini',
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  apiKey: process.env.LLM_API_KEY,
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000', 10),
};

export const GRADE_LEVEL_AGE_MAPPING: Record<string, { minAge: number; maxAge: number; description: string }> = {
  kindergarten: { minAge: 4, maxAge: 6, description: 'Ages 4-6, Pre-reading to early reading' },
  grade_1: { minAge: 6, maxAge: 7, description: 'Ages 6-7, Early reading, basic math concepts' },
  grade_2: { minAge: 7, maxAge: 8, description: 'Ages 7-8, Developing reading fluency, simple problem-solving' },
  grade_3: { minAge: 8, maxAge: 9, description: 'Ages 8-9, Reading comprehension, multiplication basics' },
  grade_4: { minAge: 9, maxAge: 10, description: 'Ages 9-10, Multi-step problems, critical thinking' },
  grade_5: { minAge: 10, maxAge: 11, description: 'Ages 10-11, Complex reasoning, abstract concepts' },
};
