/**
 * Grading Engine
 * Compares student answers to rubrics and generates feedback
 */

import { LLMService } from '../services/llm.service.js';
import { privacyGuard, sanitizePII } from '../middleware/privacy-guard.js';
import type {
  GradingResult,
  Rubric,
  StudentAnswer,
  LLMConfig,
} from '../types/ai.js';

export interface GradingOptions {
  rubric: Rubric;
  gradeLevel?: string;
  subject?: string;
  maxScore?: number;
  llmConfig?: Partial<LLMConfig>;
  useAIForFeedback?: boolean; // If false, use rule-based grading only
}

export class GradingEngine {
  private llmService: LLMService;
  private privacyGuard: ReturnType<typeof privacyGuard>;

  constructor(llmService?: LLMService) {
    this.llmService = llmService || new LLMService();
    this.privacyGuard = privacyGuard();
  }

  /**
   * Grade student answer against rubric
   */
  async grade(
    studentAnswer: StudentAnswer,
    options: GradingOptions
  ): Promise<GradingResult> {
    const {
      rubric,
      gradeLevel = 'grade_3',
      subject = 'general',
      maxScore,
      llmConfig,
      useAIForFeedback = true,
    } = options;

    // Sanitize student answer to remove PII
    const answerContent =
      typeof studentAnswer.content === 'string'
        ? studentAnswer.content
        : JSON.stringify(studentAnswer.content);

    const sanitized = this.privacyGuard(answerContent);
    if (sanitized.removedFields.length > 0) {
      console.warn(`PII removed from student answer: ${sanitized.removedFields.join(', ')}`);
    }

    // Perform rubric-based grading
    const rubricScores = this.evaluateRubric(sanitized.sanitized, rubric);

    // Calculate total score
    const totalScore = this.calculateTotalScore(rubricScores, rubric);
    const finalMaxScore = maxScore || rubric.totalPoints;
    const gradePercentage = finalMaxScore > 0 ? (totalScore / finalMaxScore) * 100 : 0;

    // Generate feedback
    let encouragingFeedback: string;
    let instructionalInsight: string;
    let strengths: string[];
    let areasForImprovement: string[];

    if (useAIForFeedback) {
      // Use AI to generate contextual feedback
      const aiFeedback = await this.generateAIFeedback(
        sanitized.sanitized,
        rubricScores,
        rubric,
        gradeLevel,
        subject,
        llmConfig
      );

      encouragingFeedback = aiFeedback.encouragingFeedback;
      instructionalInsight = aiFeedback.instructionalInsight;
      strengths = aiFeedback.strengths || [];
      areasForImprovement = aiFeedback.areasForImprovement || [];
    } else {
      // Use rule-based feedback
      const ruleBasedFeedback = this.generateRuleBasedFeedback(rubricScores, rubric);
      encouragingFeedback = ruleBasedFeedback.encouragingFeedback;
      instructionalInsight = ruleBasedFeedback.instructionalInsight;
      strengths = ruleBasedFeedback.strengths || [];
      areasForImprovement = ruleBasedFeedback.areasForImprovement || [];
    }

    return {
      score: totalScore,
      maxScore: finalMaxScore,
      gradePercentage: Math.round(gradePercentage * 100) / 100, // Round to 2 decimals
      encouragingFeedback,
      instructionalInsight,
      strengths,
      areasForImprovement,
      rubricAlignment: rubricScores,
    };
  }

  /**
   * Evaluate student answer against rubric criteria
   */
  private evaluateRubric(
    answer: string,
    rubric: Rubric
  ): GradingResult['rubricAlignment'] {
    const scores: GradingResult['rubricAlignment'] = [];

    for (const criterion of rubric.criteria) {
      // Use AI or rule-based evaluation for each criterion
      const evaluation = this.evaluateCriterion(answer, criterion, rubric);

      scores.push({
        criterion: criterion.name,
        score: evaluation.score,
        maxScore: criterion.maxPoints,
        notes: evaluation.notes,
      });
    }

    return scores;
  }

  /**
   * Evaluate a single criterion (can be enhanced with AI)
   */
  private evaluateCriterion(
    answer: string,
    criterion: Rubric['criteria'][0],
    rubric: Rubric
  ): { score: number; notes: string } {
    // Basic rule-based evaluation
    // This can be enhanced with AI-based evaluation per criterion

    // Check if answer addresses the criterion
    const criterionKeywords = this.extractKeywords(criterion.description);
    const answerLower = answer.toLowerCase();

    // Calculate keyword coverage
    let matchedKeywords = 0;
    for (const keyword of criterionKeywords) {
      if (answerLower.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    }

    const keywordCoverage = criterionKeywords.length > 0
      ? matchedKeywords / criterionKeywords.length
      : 0.5; // Default if no keywords found

    // Calculate score based on coverage (can be made more sophisticated)
    const rawScore = keywordCoverage * criterion.maxPoints;
    const score = Math.max(0, Math.min(criterion.maxPoints, rawScore));

    // Generate notes
    const percentage = Math.round((score / criterion.maxPoints) * 100);
    let notes = `Scored ${percentage}%: `;
    
    if (score >= criterion.maxPoints * 0.8) {
      notes += 'Excellent work addressing this criterion.';
    } else if (score >= criterion.maxPoints * 0.6) {
      notes += 'Good effort, but some aspects could be improved.';
    } else if (score >= criterion.maxPoints * 0.4) {
      notes += 'Partial understanding demonstrated.';
    } else {
      notes += 'Needs significant improvement in this area.';
    }

    return { score: Math.round(score * 100) / 100, notes };
  }

  /**
   * Calculate total score from rubric scores
   */
  private calculateTotalScore(
    rubricScores: GradingResult['rubricAlignment'],
    rubric: Rubric
  ): number {
    if (!rubricScores || rubricScores.length === 0) {
      return 0;
    }

    // Check if using weighted scoring
    const hasWeights = rubric.criteria.some((c) => c.weight !== undefined);

    if (hasWeights) {
      // Weighted scoring
      let totalWeight = 0;
      let weightedScore = 0;

      for (const scoreItem of rubricScores) {
        const criterion = rubric.criteria.find((c) => c.name === scoreItem.criterion);
        const weight = criterion?.weight || 1;
        totalWeight += weight;
        weightedScore += (scoreItem.score / scoreItem.maxScore) * weight * rubric.totalPoints;
      }

      return totalWeight > 0 ? weightedScore / totalWeight : 0;
    } else {
      // Simple sum of scores
      const totalPossible = rubric.criteria.reduce((sum, c) => sum + c.maxPoints, 0);
      const totalEarned = rubricScores.reduce((sum, s) => sum + s.score, 0);

      // Scale to rubric.totalPoints if needed
      if (totalPossible !== rubric.totalPoints && totalPossible > 0) {
        return (totalEarned / totalPossible) * rubric.totalPoints;
      }

      return totalEarned;
    }
  }

  /**
   * Generate AI-powered feedback
   */
  private async generateAIFeedback(
    answer: string,
    rubricScores: GradingResult['rubricAlignment'],
    rubric: Rubric,
    gradeLevel: string,
    subject: string,
    llmConfig?: Partial<LLMConfig>
  ): Promise<{
    encouragingFeedback: string;
    instructionalInsight: string;
    strengths: string[];
    areasForImprovement: string[];
  }> {
    const systemPrompt = `You are an expert K-5 educator providing constructive feedback to students and instructional insights to teachers.

Grade Level: ${gradeLevel}
Subject: ${subject}

Your feedback should be:
- Age-appropriate and encouraging for students
- Specific and actionable for teachers
- Focused on growth and learning
- Aligned with rubric criteria`;

    const rubricSummary = rubricScores
      .map(
        (s) =>
          `- ${s.criterion}: ${s.score}/${s.maxScore} points - ${s.notes}`
      )
      .join('\n');

    const totalScore = rubricScores.reduce((sum, s) => sum + s.score, 0);
    const maxScore = rubricScores.reduce((sum, s) => sum + s.maxScore, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    const userPrompt = `Student answer (grade level: ${gradeLevel}):
${answer.substring(0, 2000)}${answer.length > 2000 ? '...' : ''}

Rubric evaluation:
${rubricSummary}

Overall score: ${totalScore}/${maxScore} (${percentage}%)

Generate feedback in the following JSON format:
{
  "encouragingFeedback": "Encouraging, age-appropriate feedback for the student (2-3 sentences)",
  "instructionalInsight": "Instructional insight for the teacher about student performance and next steps (2-3 sentences)",
  "strengths": ["Strength 1", "Strength 2"],
  "areasForImprovement": ["Area 1", "Area 2"]
}

Focus on being constructive and specific.`;

    const response = await this.llmService.generateCompletion({
      prompt: userPrompt,
      systemPrompt,
      config: llmConfig,
    });

    // Parse AI response
    try {
      let jsonString = response.content.trim();
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonString);
      return {
        encouragingFeedback: parsed.encouragingFeedback || 'Great effort on this assignment!',
        instructionalInsight: parsed.instructionalInsight || 'Review rubric alignment and provide targeted support.',
        strengths: parsed.strengths || [],
        areasForImprovement: parsed.areasForImprovement || [],
      };
    } catch (error) {
      console.warn('Failed to parse AI feedback, using fallback');
      return this.generateRuleBasedFeedback(rubricScores, rubric);
    }
  }

  /**
   * Generate rule-based feedback (fallback)
   */
  private generateRuleBasedFeedback(
    rubricScores: GradingResult['rubricAlignment'],
    rubric: Rubric
  ): {
    encouragingFeedback: string;
    instructionalInsight: string;
    strengths: string[];
    areasForImprovement: string[];
  } {
    const totalScore = rubricScores.reduce((sum, s) => sum + s.score, 0);
    const maxScore = rubricScores.reduce((sum, s) => sum + s.maxScore, 0);
    const percentage = (totalScore / maxScore) * 100;

    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    for (const score of rubricScores) {
      const scorePercentage = (score.score / score.maxScore) * 100;
      if (scorePercentage >= 80) {
        strengths.push(score.criterion);
      } else if (scorePercentage < 60) {
        areasForImprovement.push(score.criterion);
      }
    }

    let encouragingFeedback: string;
    if (percentage >= 90) {
      encouragingFeedback = 'Outstanding work! You demonstrated excellent understanding of the concepts.';
    } else if (percentage >= 80) {
      encouragingFeedback = 'Great job! You showed strong comprehension of the material.';
    } else if (percentage >= 70) {
      encouragingFeedback = 'Good effort! You understand most of the concepts, with some areas to strengthen.';
    } else if (percentage >= 60) {
      encouragingFeedback = 'Nice try! Keep practicing and reviewing the material.';
    } else {
      encouragingFeedback = 'Keep working hard! Review the material and try again.';
    }

    let instructionalInsight: string;
    if (strengths.length > areasForImprovement.length) {
      instructionalInsight = `Student demonstrates strength in ${strengths.join(', ')}. Focus support on ${areasForImprovement.join(', ') || 'general reinforcement'}.`;
    } else {
      instructionalInsight = `Student needs additional support in ${areasForImprovement.join(', ') || 'multiple areas'}. Consider reviewing key concepts and providing targeted practice.`;
    }

    return {
      encouragingFeedback,
      instructionalInsight,
      strengths,
      areasForImprovement,
    };
  }

  /**
   * Extract keywords from text (simple implementation)
   */
  private extractKeywords(text: string): string[] {
    // Remove common stop words and extract meaningful words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }
}
