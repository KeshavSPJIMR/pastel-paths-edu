/**
 * QuizGen Engine
 * Generates age-appropriate multiple-choice questions from curriculum text
 */

import { LLMService } from '../services/llm.service.js';
import { privacyGuard, sanitizePII } from '../middleware/privacy-guard.js';
import { GRADE_LEVEL_AGE_MAPPING } from '../config/ai.config.js';
import type { QuizGenResult, MultipleChoiceQuestion, LLMConfig } from '../types/ai.js';

export interface QuizGenOptions {
  gradeLevel: string;
  subject?: string;
  curriculumStandard?: string;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  llmConfig?: Partial<LLMConfig>;
}

export class QuizGenEngine {
  private llmService: LLMService;
  private privacyGuard: ReturnType<typeof privacyGuard>;

  constructor(llmService?: LLMService) {
    this.llmService = llmService || new LLMService();
    this.privacyGuard = privacyGuard();
  }

  /**
   * Generate quiz questions from curriculum text
   */
  async generateQuiz(
    curriculumText: string,
    options: QuizGenOptions
  ): Promise<QuizGenResult> {
    const {
      gradeLevel,
      subject = 'general',
      curriculumStandard,
      numberOfQuestions = 5,
      difficulty = 'medium',
      llmConfig,
    } = options;

    // Validate grade level
    if (!GRADE_LEVEL_AGE_MAPPING[gradeLevel]) {
      throw new Error(`Invalid grade level: ${gradeLevel}`);
    }

    // Sanitize curriculum text to remove PII
    const sanitized = this.privacyGuard(curriculumText);
    if (sanitized.removedFields.length > 0) {
      console.warn(`PII removed from curriculum text: ${sanitized.removedFields.join(', ')}`);
    }

    // Get age-appropriate context
    const ageInfo = GRADE_LEVEL_AGE_MAPPING[gradeLevel];
    const ageDescription = ageInfo.description;

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(gradeLevel, ageDescription, subject, difficulty);

    // Build user prompt
    const userPrompt = this.buildQuizPrompt(
      sanitized.sanitized,
      numberOfQuestions,
      curriculumStandard
    );

    // Generate questions using LLM
    const response = await this.llmService.generateCompletion({
      prompt: userPrompt,
      systemPrompt,
      config: llmConfig,
    });

    // Parse and validate generated questions
    const questions = this.parseQuestions(response.content, numberOfQuestions);

    return {
      questions,
      metadata: {
        gradeLevel,
        subject,
        curriculumStandard,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Build system prompt with age-appropriate guidelines
   */
  private buildSystemPrompt(
    gradeLevel: string,
    ageDescription: string,
    subject: string,
    difficulty: string
  ): string {
    return `You are an expert K-5 educator specializing in creating age-appropriate educational content.

Grade Level: ${gradeLevel} (${ageDescription})
Subject: ${subject}
Difficulty: ${difficulty}

Guidelines:
1. Create clear, age-appropriate multiple-choice questions
2. Use vocabulary and concepts suitable for this grade level
3. Ensure questions assess understanding, not just recall
4. Provide exactly 4 options (A, B, C, D) with one correct answer
5. Make incorrect options plausible but clearly distinguishable
6. Include brief explanations for the correct answer
7. Avoid ambiguous wording
8. Questions should be engaging and educational

Output format (JSON):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why the answer is correct"
    }
  ]
}`;
  }

  /**
   * Build user prompt for quiz generation
   */
  private buildQuizPrompt(
    curriculumText: string,
    numberOfQuestions: number,
    curriculumStandard?: string
  ): string {
    let prompt = `Based on the following curriculum text, generate exactly ${numberOfQuestions} age-appropriate multiple-choice questions.

Curriculum Text:
${curriculumText}
`;

    if (curriculumStandard) {
      prompt += `\nCurriculum Standard: ${curriculumStandard}`;
    }

    prompt += `\n\nGenerate the questions in the specified JSON format. Ensure variety in question types and difficulty within the specified range.`;

    return prompt;
  }

  /**
   * Parse and validate generated questions from LLM response
   */
  private parseQuestions(
    llmResponse: string,
    expectedCount: number
  ): MultipleChoiceQuestion[] {
    // Try to extract JSON from response (might have markdown code blocks)
    let jsonString = llmResponse.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    // Try to find JSON object in the response
    const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonString = jsonObjectMatch[0];
    }

    let parsed: { questions?: any[] };
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      // If JSON parsing fails, try to extract questions manually
      console.warn('Failed to parse JSON response, attempting manual extraction');
      return this.extractQuestionsManually(llmResponse, expectedCount);
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format: missing questions array');
    }

    // Validate and normalize questions
    const questions: MultipleChoiceQuestion[] = parsed.questions
      .slice(0, expectedCount)
      .map((q: any, index: number) => {
        if (!q.question || !q.options || !Array.isArray(q.options)) {
          throw new Error(`Invalid question format at index ${index}`);
        }

        // Normalize correctAnswer (can be 0-based index or option letter)
        let correctAnswer = q.correctAnswer;
        if (typeof correctAnswer === 'string') {
          const letterIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer.toUpperCase());
          if (letterIndex >= 0) {
            correctAnswer = letterIndex;
          } else {
            throw new Error(`Invalid correctAnswer: ${correctAnswer}`);
          }
        }

        if (correctAnswer < 0 || correctAnswer >= q.options.length) {
          throw new Error(`Invalid correctAnswer index: ${correctAnswer}`);
        }

        return {
          question: q.question.trim(),
          options: q.options.slice(0, 4).map((opt: string) => opt.trim()),
          correctAnswer,
          explanation: q.explanation?.trim(),
        };
      });

    if (questions.length < expectedCount) {
      console.warn(`Generated ${questions.length} questions, expected ${expectedCount}`);
    }

    return questions;
  }

  /**
   * Fallback: Extract questions manually if JSON parsing fails
   */
  private extractQuestionsManually(
    response: string,
    expectedCount: number
  ): MultipleChoiceQuestion[] {
    const questions: MultipleChoiceQuestion[] = [];
    const questionBlocks = response.split(/\n\s*\n/);

    for (const block of questionBlocks) {
      if (questions.length >= expectedCount) break;

      const questionMatch = block.match(/^\d+[\.\)]\s*(.+?)(?=\n[A-D])/s);
      if (!questionMatch) continue;

      const question = questionMatch[1].trim();
      const options: string[] = [];
      let correctAnswer = -1;

      // Extract options
      const optionPattern = /^([A-D])[\.\)]\s*(.+)$/gm;
      let match;
      while ((match = optionPattern.exec(block)) !== null && options.length < 4) {
        options.push(match[2].trim());
      }

      // Try to identify correct answer (look for indicators like "*", "(correct)", etc.)
      const correctIndicator = block.match(/\*|\(correct\)|✓|\[CORRECT\]/i);
      if (correctIndicator) {
        // Find which option contains the indicator
        for (let i = 0; i < options.length; i++) {
          if (block.includes(`[A-D][.)]\\s*${options[i]}`) && block.includes(correctIndicator[0])) {
            correctAnswer = i;
            break;
          }
        }
      }

      // If no indicator found, default to first option (not ideal but better than nothing)
      if (correctAnswer === -1 && options.length >= 2) {
        correctAnswer = 0; // Default to first option
        console.warn('Could not determine correct answer, defaulting to first option');
      }

      if (question && options.length >= 2 && correctAnswer >= 0) {
        questions.push({
          question,
          options,
          correctAnswer,
        });
      }
    }

    return questions;
  }
}
