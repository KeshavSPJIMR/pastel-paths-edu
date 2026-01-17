/**
 * Example usage of AI Service components
 */

import { QuizGenEngine, GradingEngine, LLMService, sanitizePII } from '../src/index.js';
import type { Rubric } from '../src/types/ai.js';

// Example 1: Generate quiz questions
async function exampleQuizGen() {
  console.log('=== QuizGen Example ===\n');

  const engine = new QuizGenEngine();

  const curriculumText = `
    The water cycle is the continuous movement of water on, above, and below Earth's surface.
    Water evaporates from oceans, lakes, and rivers when the sun heats it up. The water vapor
    rises into the atmosphere where it cools and condenses into clouds. When clouds become too
    heavy, water falls back to Earth as precipitation in the form of rain, snow, sleet, or hail.
    This water then flows back into rivers, lakes, and oceans, and the cycle begins again.
  `;

  try {
    const quiz = await engine.generateQuiz(curriculumText, {
      gradeLevel: 'grade_3',
      subject: 'science',
      curriculumStandard: 'CCSS.3.ESS.2.1',
      numberOfQuestions: 5,
      difficulty: 'medium',
    });

    console.log('Generated Quiz:');
    quiz.questions.forEach((q, i) => {
      console.log(`\n${i + 1}. ${q.question}`);
      q.options.forEach((opt, j) => {
        const marker = j === q.correctAnswer ? '✓' : ' ';
        console.log(`   ${marker} ${String.fromCharCode(65 + j)}. ${opt}`);
      });
      if (q.explanation) {
        console.log(`   Explanation: ${q.explanation}`);
      }
    });

    console.log('\nMetadata:', quiz.metadata);
  } catch (error) {
    console.error('Error generating quiz:', error);
  }
}

// Example 2: Grade student answer
async function exampleGrading() {
  console.log('\n=== Grading Example ===\n');

  const engine = new GradingEngine();

  const rubric: Rubric = {
    totalPoints: 100,
    criteria: [
      {
        name: 'Understanding of Water Cycle',
        description: 'Demonstrates understanding of evaporation, condensation, and precipitation',
        maxPoints: 40,
      },
      {
        name: 'Scientific Accuracy',
        description: 'Provides scientifically accurate information',
        maxPoints: 30,
      },
      {
        name: 'Completeness',
        description: 'Addresses all parts of the question',
        maxPoints: 20,
      },
      {
        name: 'Clarity',
        description: 'Clear and organized explanation',
        maxPoints: 10,
      },
    ],
  };

  const studentAnswer = `
    The water cycle is how water moves around. First, the sun heats up water in oceans and lakes,
    and the water turns into water vapor. This is called evaporation. The water vapor goes up
    into the sky where it gets cold and turns into clouds. This is condensation. When the clouds
    get too heavy, the water falls back down as rain or snow. This is precipitation. Then the
    water goes back into the ocean and starts all over again.
  `;

  try {
    const result = await engine.grade(
      { content: studentAnswer },
      {
        rubric,
        gradeLevel: 'grade_3',
        subject: 'science',
        useAIForFeedback: true,
      }
    );

    console.log('Grading Result:');
    console.log(`Score: ${result.score}/${result.maxScore} (${result.gradePercentage}%)`);
    console.log('\nEncouraging Feedback (for student):');
    console.log(result.encouragingFeedback);
    console.log('\nInstructional Insight (for teacher):');
    console.log(result.instructionalInsight);

    if (result.strengths && result.strengths.length > 0) {
      console.log('\nStrengths:', result.strengths);
    }

    if (result.areasForImprovement && result.areasForImprovement.length > 0) {
      console.log('\nAreas for Improvement:', result.areasForImprovement);
    }

    console.log('\nRubric Alignment:');
    result.rubricAlignment?.forEach((alignment) => {
      console.log(`  ${alignment.criterion}: ${alignment.score}/${alignment.maxScore} - ${alignment.notes}`);
    });
  } catch (error) {
    console.error('Error grading:', error);
  }
}

// Example 3: Privacy Guard
function examplePrivacyGuard() {
  console.log('\n=== Privacy Guard Example ===\n');

  const contentWithPII = `
    Student Name: Jane Smith
    Email: jane.smith@school.edu
    Phone: (555) 123-4567
    Address: 123 Main Street, Anytown, CA 12345
    Date of Birth: 05/15/2015
    Student ID: STU-2024-12345
    
    Assignment: Write about your favorite animal.
    Answer: My favorite animal is a dolphin because they are very smart and friendly.
  `;

  const sanitized = sanitizePII(contentWithPII, {
    mask: true,
    preserveContext: true,
  });

  console.log('Original Content:');
  console.log(contentWithPII);
  console.log('\nSanitized Content:');
  console.log(sanitized.sanitized);
  console.log('\nRemoved PII Types:', sanitized.removedFields);
}

// Example 4: Custom LLM Configuration
async function exampleCustomLLM() {
  console.log('\n=== Custom LLM Configuration Example ===\n');

  // Create LLM service with custom config
  const llmService = new LLMService({
    provider: 'ollama',
    model: 'phi3:mini',
    baseUrl: 'http://localhost:11434',
    temperature: 0.8,
    maxTokens: 1500,
  });

  // Create engines with custom LLM service
  const quizEngine = new QuizGenEngine(llmService);
  const gradingEngine = new GradingEngine(llmService);

  console.log('Engines configured with custom LLM service');
  console.log('Config:', llmService.getConfig());
}

// Run examples
async function runExamples() {
  try {
    // Uncomment to run specific examples:
    // await exampleQuizGen();
    // await exampleGrading();
    examplePrivacyGuard();
    // await exampleCustomLLM();
  } catch (error) {
    console.error('Example error:', error);
  }
}

// Export for use or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export { exampleQuizGen, exampleGrading, examplePrivacyGuard, exampleCustomLLM };
