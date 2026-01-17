# AI Service Architecture

## Overview

The AI Service provides three core components for the K-5 LMS backend:

1. **LLM Service**: Abstraction layer for SLM interactions (Ollama/Phi-3 Mini or external APIs)
2. **QuizGen Engine**: Generates age-appropriate multiple-choice questions from curriculum text
3. **Grading Engine**: Compares student answers to rubrics with AI-generated feedback
4. **Privacy Guard**: Middleware ensuring no PII is sent to external LLM APIs (COPPA/FERPA compliance)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (QuizGen Engine | Grading Engine | Privacy Guard)      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     LLM Service                          │
│         (Abstraction for Ollama/External APIs)          │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Ollama Provider    │      │   External API       │
│  (Local/Remote)      │      │   (OpenAI-compatible)│
│  - phi3:mini         │      │   - Requires API key │
│  - llama2            │      │                      │
└──────────────────────┘      └──────────────────────┘
```

## Component Details

### 1. LLM Service (`services/llm.service.ts`)

**Purpose**: Provides a unified interface for LLM interactions.

**Features**:
- Supports Ollama (local/remote) and external APIs
- Compatible with Phi-3 Mini and other SLMs
- Streaming support (for Ollama)
- Configurable temperature, max tokens, etc.

**Usage**:
```typescript
const llmService = new LLMService({
  provider: 'ollama',
  model: 'phi3:mini',
  baseUrl: 'http://localhost:11434',
});

const response = await llmService.generateCompletion({
  prompt: 'Generate a quiz question...',
  systemPrompt: 'You are an expert educator...',
});
```

### 2. QuizGen Engine (`engines/quiz-gen.engine.ts`)

**Purpose**: Generates age-appropriate multiple-choice questions from curriculum text.

**Features**:
- Grade-level appropriate content generation
- Curriculum standard alignment
- Configurable difficulty (easy/medium/hard)
- Automatic PII sanitization
- Structured JSON output with 4 options per question

**Usage**:
```typescript
const engine = new QuizGenEngine();

const quiz = await engine.generateQuiz(curriculumText, {
  gradeLevel: 'grade_3',
  subject: 'science',
  curriculumStandard: 'CCSS.3.ESS.2.1',
  numberOfQuestions: 5,
  difficulty: 'medium',
});
```

**Process Flow**:
1. Sanitize curriculum text (remove PII via Privacy Guard)
2. Build age-appropriate system prompt
3. Generate questions via LLM
4. Parse and validate JSON response
5. Return structured quiz object

### 3. Grading Engine (`engines/grading.engine.ts`)

**Purpose**: Compares student answers to rubrics and generates feedback.

**Features**:
- Rubric-based scoring
- Weighted or simple scoring
- AI-generated encouraging feedback (for students)
- AI-generated instructional insights (for teachers)
- Rule-based fallback if AI unavailable
- Automatic PII sanitization

**Usage**:
```typescript
const engine = new GradingEngine();

const result = await engine.grade(studentAnswer, {
  rubric: {
    totalPoints: 100,
    criteria: [/* ... */],
  },
  gradeLevel: 'grade_3',
  useAIForFeedback: true,
});
```

**Process Flow**:
1. Sanitize student answer (remove PII)
2. Evaluate each rubric criterion
3. Calculate total score (weighted or simple)
4. Generate AI feedback (or use rule-based fallback)
5. Return structured grading result

**Output Structure**:
```typescript
{
  score: 85,
  maxScore: 100,
  gradePercentage: 85,
  encouragingFeedback: "Great job! ...", // For student
  instructionalInsight: "Student demonstrates...", // For teacher
  strengths: ["Understanding", "Clarity"],
  areasForImprovement: ["Application"],
  rubricAlignment: [/* ... */],
}
```

### 4. Privacy Guard (`middleware/privacy-guard.ts`)

**Purpose**: Ensures no PII is sent to external LLM APIs (Regulatory Force constraint).

**Features**:
- Detects and removes/masks:
  - Email addresses
  - Phone numbers
  - Social Security Numbers
  - Dates of birth
  - Street addresses
  - ZIP codes
  - School/Student IDs
  - Names (heuristic detection)
- Preserves context for better LLM understanding
- Recursively sanitizes nested objects
- Validation function to check content safety

**Usage**:
```typescript
import { sanitizePII, privacyGuard, validateNoPII } from './middleware/privacy-guard';

// Direct sanitization
const sanitized = sanitizePII('Email: john@example.com', {
  mask: true,
  preserveContext: true,
});
// Result: 'Email: [EMAIL_REDACTED]'

// Middleware function
const guard = privacyGuard();
const safe = guard('Text with PII');

// Validation
const validation = validateNoPII('Some text');
console.log(validation.safe, validation.warnings);
```

**Compliance**:
- **COPPA**: Children's Online Privacy Protection Act
- **FERPA**: Family Educational Rights and Privacy Act
- **State privacy regulations**

## Data Flow

### Quiz Generation Flow

```
Curriculum Text (with potential PII)
    ↓
Privacy Guard (sanitize PII)
    ↓
QuizGen Engine (build prompts)
    ↓
LLM Service (generate questions)
    ↓
Parse & Validate JSON
    ↓
Structured Quiz Object
```

### Grading Flow

```
Student Answer (with potential PII)
    ↓
Privacy Guard (sanitize PII)
    ↓
Grading Engine (evaluate rubric)
    ↓
LLM Service (generate feedback) [optional]
    ↓
Structured Grading Result
```

## Configuration

Configuration is managed via environment variables (see `.env.example`):

- `LLM_PROVIDER`: 'ollama' or 'api'
- `LLM_MODEL`: Model name (e.g., 'phi3:mini')
- `OLLAMA_BASE_URL`: Ollama instance URL
- `LLM_API_KEY`: API key for external providers
- `LLM_TEMPERATURE`: LLM temperature (0.0-1.0)
- `LLM_MAX_TOKENS`: Maximum tokens in response

## Error Handling

All components include error handling:
- **LLM Service**: Catches API errors, network failures
- **QuizGen Engine**: Fallback parsing if JSON fails, manual extraction
- **Grading Engine**: Fallback to rule-based feedback if AI unavailable
- **Privacy Guard**: Logs warnings when PII is detected/removed

## Performance Considerations

1. **Caching**: Consider caching generated questions for similar curriculum text
2. **Batch Processing**: For multiple students, batch requests when possible
3. **Streaming**: Use streaming for real-time feedback (supported in LLM Service)
4. **Local LLMs**: Ollama (local) reduces latency and costs

## Security & Privacy

1. **PII Sanitization**: All content is sanitized before LLM calls
2. **API Keys**: Stored in environment variables, never committed
3. **Logging**: PII removal is logged for audit purposes
4. **Validation**: Content can be validated before sending to LLMs

## Testing

Example usage provided in `examples/usage.ts`. Run:

```bash
cd server
npm run build
node examples/usage.js
```

## Integration Points

The service can be integrated with:
- **Supabase Edge Functions** (Deno-compatible)
- **Node.js Backend** (Express, FastAPI, etc.)
- **Standalone API Server**
- **Microservices Architecture**

For Supabase Edge Functions, adapt imports to Deno-compatible format if needed.
