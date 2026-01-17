# AI Service for K-5 LMS

Server-side AI service supporting QuizGen, Grading, and Privacy Guard functionality.

## Features

- **LLM Service**: Supports Ollama (local) and external API providers (Phi-3 Mini, etc.)
- **QuizGen Engine**: Generates age-appropriate multiple-choice questions from curriculum text
- **Grading Engine**: Compares student answers to rubrics with AI-generated feedback
- **Privacy Guard**: Middleware to ensure no PII is sent to external LLM APIs (COPPA/FERPA compliance)

## Installation

```bash
cd server
npm install
npm run build
```

## Configuration

Set environment variables:

```bash
# LLM Provider (ollama or api)
LLM_PROVIDER=ollama

# Model name
LLM_MODEL=phi3:mini

# Ollama base URL (for local instance)
OLLAMA_BASE_URL=http://localhost:11434

# API key (for external API provider)
LLM_API_KEY=your-api-key-here

# LLM parameters
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
```

## Usage

### QuizGen Engine

```typescript
import { QuizGenEngine } from './src/index.js';

const engine = new QuizGenEngine();

const quiz = await engine.generateQuiz(
  'The water cycle includes evaporation, condensation, and precipitation...',
  {
    gradeLevel: 'grade_3',
    subject: 'science',
    curriculumStandard: 'CCSS.3.ESS.2.1',
    numberOfQuestions: 5,
    difficulty: 'medium',
  }
);

console.log(quiz.questions);
```

### Grading Engine

```typescript
import { GradingEngine } from './src/index.js';

const engine = new GradingEngine();

const rubric = {
  totalPoints: 100,
  criteria: [
    {
      name: 'Understanding',
      description: 'Demonstrates understanding of key concepts',
      maxPoints: 40,
    },
    {
      name: 'Application',
      description: 'Applies concepts correctly',
      maxPoints: 40,
    },
    {
      name: 'Presentation',
      description: 'Clear and organized presentation',
      maxPoints: 20,
    },
  ],
};

const result = await engine.grade(
  {
    content: 'Student answer text here...',
  },
  {
    rubric,
    gradeLevel: 'grade_3',
    subject: 'science',
    useAIForFeedback: true,
  }
);

console.log(result.encouragingFeedback);
console.log(result.instructionalInsight);
```

### Privacy Guard

```typescript
import { sanitizePII, privacyGuard, validateNoPII } from './src/index.js';

// Sanitize content
const sanitized = sanitizePII('Contact: john.doe@email.com', {
  mask: true,
  preserveContext: true,
});
// Result: 'Contact: [EMAIL_REDACTED]'

// Validate content
const validation = validateNoPII('Some text with email@example.com');
console.log(validation.safe); // false
console.log(validation.warnings); // ['Potential email detected']

// Middleware usage
const guard = privacyGuard();
const safeContent = guard('Text with PII');
```

## Architecture

```
server/
├── src/
│   ├── services/
│   │   └── llm.service.ts       # LLM abstraction layer
│   ├── engines/
│   │   ├── quiz-gen.engine.ts   # Quiz generation logic
│   │   └── grading.engine.ts    # Grading and feedback logic
│   ├── middleware/
│   │   └── privacy-guard.ts     # PII sanitization
│   ├── config/
│   │   └── ai.config.ts         # Configuration
│   ├── types/
│   │   └── ai.ts                # TypeScript types
│   └── index.ts                 # Main exports
```

## Privacy & Compliance

The Privacy Guard middleware automatically:
- Detects and removes/masks email addresses
- Detects and removes/masks phone numbers
- Detects and removes/masks SSNs
- Detects and removes/masks dates of birth
- Detects and removes/masks addresses
- Removes PII from nested objects

This ensures compliance with:
- **COPPA** (Children's Online Privacy Protection Act)
- **FERPA** (Family Educational Rights and Privacy Act)
- **State privacy regulations**

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests (if implemented)
npm test
```

## Integration with Supabase

This service can be used with:
- Supabase Edge Functions (Deno)
- Node.js backend services
- Standalone API servers

For Supabase Edge Functions, adapt the imports and use Deno's fetch API (already compatible).
