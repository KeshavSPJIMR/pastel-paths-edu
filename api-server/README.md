# API Server

Express API server for the K-5 LMS, providing endpoints for QuizGen Engine and other services.

## Setup

1. Install dependencies:
```bash
cd api-server
npm install
```

2. Set environment variables (create `.env` file):
```bash
# API Configuration
API_PORT=3001
FRONTEND_URL=http://localhost:8080

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
# Or use anon key for development:
# SUPABASE_ANON_KEY=your-supabase-anon-key

# LLM Configuration (for QuizGen Engine)
LLM_PROVIDER=ollama
LLM_MODEL=phi3:mini
OLLAMA_BASE_URL=http://localhost:11434
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
```

3. Ensure the server folder is accessible (same level as api-server folder)

## Running

### Development (TypeScript with hot reload):
```bash
npm run dev
```

### Production:
```bash
npm run build
npm run start:prod
```

## Endpoints

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/generate-quiz
Generate quiz from curriculum text using QuizGen Engine.

**Request Body:**
```json
{
  "curriculumText": "The water cycle includes...",
  "gradeLevel": "grade_3",
  "subject": "science",
  "curriculumStandard": "CCSS.3.ESS.2.1",
  "numberOfQuestions": 5,
  "difficulty": "medium",
  "teacherId": "uuid-here",
  "title": "Water Cycle Quiz"
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "questions": [...],
    "metadata": {...}
  },
  "assignment": {
    "id": "uuid",
    "title": "...",
    ...
  },
  "metadata": {
    "generatedAt": "...",
    "curriculumLength": 1234,
    "questionsGenerated": 5
  }
}
```

## Integration with Frontend

The Vite dev server is configured to proxy `/api/*` requests to this API server (port 3001). No CORS issues in development.

For production, either:
1. Use a reverse proxy (nginx, etc.)
2. Serve the API on a different domain and configure CORS
3. Build everything together and serve from the same origin
