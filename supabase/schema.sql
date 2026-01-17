-- ============================================================================
-- K-5 LMS PostgreSQL Schema for Supabase
-- Designed with Venture Framing Principles
-- ============================================================================
-- Value Proposition: Teachers as Primary Actors
-- Economic Logic: Time Saved tracking via AutomationLog
-- Information Asymmetry Elimination: Cross-subject Analytics
-- ============================================================================

-- Enable UUID extension for Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles aligned with Primary Actor (Teacher) vs Student
CREATE TYPE user_role AS ENUM ('teacher', 'student');

-- Task types for assignments (extensible)
CREATE TYPE task_type AS ENUM (
    'quiz',
    'writing',
    'reading_comprehension',
    'math_problem_set',
    'project',
    'assessment',
    'homework',
    'classwork'
);

-- Subject areas for curriculum alignment and cross-subject analytics
CREATE TYPE subject_area AS ENUM (
    'math',
    'reading',
    'science',
    'social_studies',
    'language_arts',
    'art',
    'music',
    'physical_education'
);

-- Grade levels for K-5
CREATE TYPE grade_level AS ENUM (
    'kindergarten',
    'grade_1',
    'grade_2',
    'grade_3',
    'grade_4',
    'grade_5'
);

-- Submission status tracking
CREATE TYPE submission_status AS ENUM (
    'not_started',
    'in_progress',
    'submitted',
    'graded',
    'returned',
    'resubmitted'
);

-- Automation action types for tracking time saved
CREATE TYPE automation_action AS ENUM (
    'feedback_generation',
    'grading_assistance',
    'plagiarism_check',
    'curriculum_alignment',
    'performance_analysis',
    'report_generation'
);

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Primary Actors: Teachers (Primary Users)
-- Secondary Actors: Students
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL, -- References auth.users.id (Supabase Auth)
    role user_role NOT NULL,
    
    -- Basic profile information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    
    -- Teacher-specific fields
    teacher_id VARCHAR(50), -- School-assigned teacher ID
    school_name VARCHAR(255),
    school_district VARCHAR(255),
    
    -- Student-specific fields
    student_id VARCHAR(50), -- School-assigned student ID
    current_grade grade_level,
    parent_email VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Flexible storage for additional attributes
    
    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_teacher_profile CHECK (
        (role = 'teacher' AND teacher_id IS NOT NULL) OR
        (role = 'student' AND student_id IS NOT NULL AND current_grade IS NOT NULL)
    )
);

-- Indexes for profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_teacher_id ON profiles(teacher_id) WHERE teacher_id IS NOT NULL;
CREATE INDEX idx_profiles_student_id ON profiles(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX idx_profiles_current_grade ON profiles(current_grade) WHERE current_grade IS NOT NULL;

-- ============================================================================
-- ASSIGNMENTS TABLE
-- ============================================================================
-- Core entity for curriculum delivery
-- Supports metadata, curriculum alignment, and task type classification
-- ============================================================================

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ownership and access
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Assignment metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type task_type NOT NULL,
    subject_area subject_area NOT NULL,
    grade_level grade_level NOT NULL,
    
    -- Curriculum alignment (eliminates information asymmetry)
    curriculum_standard VARCHAR(100), -- e.g., "CCSS.MATH.3.NBT.A.1"
    learning_objectives JSONB DEFAULT '[]'::jsonb, -- Array of learning objectives
    tags TEXT[] DEFAULT '{}', -- For categorization and search
    
    -- Assignment details
    instructions TEXT,
    rubric JSONB, -- Flexible rubric structure
    total_points NUMERIC(10, 2) DEFAULT 100.00,
    
    -- Scheduling
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    available_from TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    
    -- Additional metadata
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of attachment URLs/metadata
    settings JSONB DEFAULT '{}'::jsonb, -- Additional assignment settings
    
    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_due_date CHECK (due_date IS NULL OR due_date >= assigned_at),
    CONSTRAINT valid_available_date CHECK (available_from IS NULL OR available_from <= COALESCE(due_date, NOW() + INTERVAL '1 year'))
);

-- Indexes for assignments
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_subject_area ON assignments(subject_area);
CREATE INDEX idx_assignments_grade_level ON assignments(grade_level);
CREATE INDEX idx_assignments_task_type ON assignments(task_type);
CREATE INDEX idx_assignments_due_date ON assignments(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_assignments_is_active ON assignments(is_active) WHERE is_active = true;
CREATE INDEX idx_assignments_created_at ON assignments(created_at DESC);
CREATE INDEX idx_assignments_tags ON assignments USING GIN(tags); -- GIN index for array search
CREATE INDEX idx_assignments_curriculum_standard ON assignments(curriculum_standard) WHERE curriculum_standard IS NOT NULL;

-- Full-text search index for assignments
CREATE INDEX idx_assignments_search ON assignments USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- ============================================================================
-- ASSIGNMENT_STUDENTS (Junction Table)
-- ============================================================================
-- Links assignments to students (many-to-many)
-- Allows for differentiated assignments per student
-- ============================================================================

CREATE TABLE assignment_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Personalized assignment settings
    customized_instructions TEXT,
    adjusted_due_date TIMESTAMPTZ,
    points_multiplier NUMERIC(3, 2) DEFAULT 1.00, -- For differentiated grading
    
    -- Status
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(assignment_id, student_id),
    CONSTRAINT valid_multiplier CHECK (points_multiplier > 0 AND points_multiplier <= 2.0)
);

-- Indexes for assignment_students
CREATE INDEX idx_assignment_students_assignment_id ON assignment_students(assignment_id);
CREATE INDEX idx_assignment_students_student_id ON assignment_students(student_id);
CREATE INDEX idx_assignment_students_is_completed ON assignment_students(is_completed);

-- ============================================================================
-- SUBMISSIONS TABLE
-- ============================================================================
-- Stores student work and AI-generated feedback
-- Core entity for tracking student performance
-- ============================================================================

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Submission content
    content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible storage for various submission types
    -- Structure example:
    -- {
    --   "text": "...",  // for writing assignments
    --   "answers": [...],  // for quiz assignments
    --   "files": [...],  // file URLs/metadata
    --   "work": "..."  // work shown for math problems
    -- }
    
    -- AI-Generated Feedback (Value Proposition for Teachers)
    ai_feedback JSONB,
    -- Structure example:
    -- {
    --   "overall_feedback": "...",
    --   "strengths": [...],
    --   "areas_for_improvement": [...],
    --   "suggestions": [...],
    --   "generated_at": "...",
    --   "model_version": "..."
    -- }
    
    ai_feedback_generated_at TIMESTAMPTZ,
    ai_confidence_score NUMERIC(5, 4), -- 0.0000 to 1.0000
    
    -- Grading
    status submission_status DEFAULT 'not_started',
    score NUMERIC(10, 2),
    max_score NUMERIC(10, 2),
    grade_percentage NUMERIC(5, 2), -- Calculated: (score / max_score) * 100
    
    teacher_feedback TEXT,
    rubric_scores JSONB, -- Detailed rubric scoring
    
    -- Submission metadata
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    
    -- Version tracking (for resubmissions)
    version INTEGER DEFAULT 1,
    is_latest_version BOOLEAN DEFAULT true,
    previous_version_id UUID REFERENCES submissions(id),
    
    -- Time tracking (for analytics)
    time_spent_minutes INTEGER, -- Estimated time spent on assignment
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_score CHECK (score IS NULL OR (score >= 0 AND score <= COALESCE(max_score, 999999))),
    CONSTRAINT valid_percentage CHECK (grade_percentage IS NULL OR (grade_percentage >= 0 AND grade_percentage <= 100)),
    CONSTRAINT valid_version CHECK (version > 0)
);

-- Indexes for submissions
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC) WHERE submitted_at IS NOT NULL;
CREATE INDEX idx_submissions_graded_at ON submissions(graded_at DESC) WHERE graded_at IS NOT NULL;
CREATE INDEX idx_submissions_is_latest_version ON submissions(is_latest_version) WHERE is_latest_version = true;
CREATE INDEX idx_submissions_grade_percentage ON submissions(grade_percentage) WHERE grade_percentage IS NOT NULL;
CREATE INDEX idx_submissions_ai_feedback_generated_at ON submissions(ai_feedback_generated_at) WHERE ai_feedback_generated_at IS NOT NULL;
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Full-text search index for submission content
CREATE INDEX idx_submissions_content_search ON submissions USING GIN(
    to_tsvector('english', coalesce(content::text, ''))
);

-- ============================================================================
-- ANALYTICS: CROSS-SUBJECT PERFORMANCE TABLE
-- ============================================================================
-- Eliminates Information Asymmetry by aggregating performance across subjects
-- Key metrics for Math, Reading, and Science (core K-5 subjects)
-- ============================================================================

CREATE TABLE cross_subject_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Time period for aggregation
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'semester', 'yearly'
    
    -- Subject-specific metrics
    math_average_score NUMERIC(5, 2), -- Average score across Math assignments
    math_total_assignments INTEGER DEFAULT 0,
    math_completed_assignments INTEGER DEFAULT 0,
    math_homework_completion_rate NUMERIC(5, 2), -- Percentage
    
    reading_average_score NUMERIC(5, 2),
    reading_total_assignments INTEGER DEFAULT 0,
    reading_completed_assignments INTEGER DEFAULT 0,
    reading_homework_completion_rate NUMERIC(5, 2),
    
    science_average_score NUMERIC(5, 2),
    science_total_assignments INTEGER DEFAULT 0,
    science_completed_assignments INTEGER DEFAULT 0,
    science_homework_completion_rate NUMERIC(5, 2),
    
    -- Cross-subject insights (Information Asymmetry Elimination)
    overall_average_score NUMERIC(5, 2), -- Average across all three subjects
    subject_strength VARCHAR(20), -- 'math', 'reading', 'science', 'balanced'
    subject_weakness VARCHAR(20), -- Identifies area needing attention
    performance_trend VARCHAR(20), -- 'improving', 'declining', 'stable'
    
    -- Engagement metrics
    total_submissions INTEGER DEFAULT 0,
    on_time_submission_rate NUMERIC(5, 2),
    average_time_spent_minutes NUMERIC(10, 2), -- Average across all subjects
    
    -- Comparative metrics
    class_rank INTEGER, -- Rank within class/grade level
    percentile_rank NUMERIC(5, 2), -- Percentile (0-100)
    
    -- Additional analytics
    insights JSONB DEFAULT '{}'::jsonb, -- AI-generated insights
    recommendations JSONB DEFAULT '[]'::jsonb, -- Actionable recommendations
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit trail
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_period CHECK (period_end >= period_start),
    CONSTRAINT valid_scores CHECK (
        (math_average_score IS NULL OR (math_average_score >= 0 AND math_average_score <= 100)) AND
        (reading_average_score IS NULL OR (reading_average_score >= 0 AND reading_average_score <= 100)) AND
        (science_average_score IS NULL OR (science_average_score >= 0 AND science_average_score <= 100)) AND
        (overall_average_score IS NULL OR (overall_average_score >= 0 AND overall_average_score <= 100))
    ),
    CONSTRAINT valid_percentile CHECK (percentile_rank IS NULL OR (percentile_rank >= 0 AND percentile_rank <= 100)),
    UNIQUE(student_id, period_start, period_end, period_type)
);

-- Indexes for cross_subject_performance
CREATE INDEX idx_cross_subject_student_id ON cross_subject_performance(student_id);
CREATE INDEX idx_cross_subject_period ON cross_subject_performance(period_start, period_end);
CREATE INDEX idx_cross_subject_period_type ON cross_subject_performance(period_type);
CREATE INDEX idx_cross_subject_overall_average ON cross_subject_performance(overall_average_score DESC) WHERE overall_average_score IS NOT NULL;
CREATE INDEX idx_cross_subject_calculated_at ON cross_subject_performance(calculated_at DESC);
CREATE INDEX idx_cross_subject_student_period ON cross_subject_performance(student_id, period_start DESC, period_end DESC);

-- ============================================================================
-- AUTOMATION LOG TABLE
-- ============================================================================
-- Tracks time saved per teacher (Economic Logic validation)
-- Quantifies value proposition for Primary Actors (Teachers)
-- ============================================================================

CREATE TABLE automation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Primary Actor
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Automation details
    action_type automation_action NOT NULL,
    description TEXT,
    
    -- Time Saved metrics (Economic Logic)
    time_saved_minutes INTEGER NOT NULL, -- Actual time saved in minutes
    estimated_manual_time_minutes INTEGER, -- Estimated time without automation
    automation_time_minutes INTEGER, -- Time taken by automation process
    
    -- Context
    assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    affected_count INTEGER DEFAULT 1, -- Number of items processed (e.g., number of submissions graded)
    
    -- Cost/Benefit analysis
    cost_saved_usd NUMERIC(10, 2), -- If applicable, monetary value of time saved
    
    -- Success metrics
    is_successful BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Store additional context
    -- Example:
    -- {
    --   "model_version": "...",
    --   "quality_score": 0.95,
    --   "teacher_review_status": "approved",
    --   "adjustments_made": 2
    -- }
    
    -- Audit trail
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_saved CHECK (time_saved_minutes >= 0),
    CONSTRAINT valid_estimated_time CHECK (estimated_manual_time_minutes IS NULL OR estimated_manual_time_minutes >= 0),
    CONSTRAINT valid_automation_time CHECK (automation_time_minutes IS NULL OR automation_time_minutes >= 0)
);

-- Indexes for automation_log
CREATE INDEX idx_automation_log_teacher_id ON automation_log(teacher_id);
CREATE INDEX idx_automation_log_action_type ON automation_log(action_type);
CREATE INDEX idx_automation_log_executed_at ON automation_log(executed_at DESC);
CREATE INDEX idx_automation_log_time_saved ON automation_log(time_saved_minutes DESC);
CREATE INDEX idx_automation_log_is_successful ON automation_log(is_successful) WHERE is_successful = true;
CREATE INDEX idx_automation_log_teacher_date ON automation_log(teacher_id, executed_at DESC);

-- ============================================================================
-- MATERIALIZED VIEW: TEACHER TIME SAVED SUMMARY
-- ============================================================================
-- Aggregated view for Economic Logic validation
-- Provides quick access to time saved metrics per teacher
-- ============================================================================

CREATE MATERIALIZED VIEW teacher_time_saved_summary AS
SELECT
    teacher_id,
    DATE_TRUNC('month', executed_at) AS month,
    action_type,
    COUNT(*) AS total_actions,
    SUM(time_saved_minutes) AS total_time_saved_minutes,
    SUM(time_saved_minutes)::NUMERIC / 60 AS total_time_saved_hours,
    AVG(time_saved_minutes) AS avg_time_saved_per_action,
    SUM(affected_count) AS total_items_processed,
    SUM(cost_saved_usd) AS total_cost_saved_usd,
    COUNT(*) FILTER (WHERE is_successful = true) AS successful_actions,
    COUNT(*) FILTER (WHERE is_successful = false) AS failed_actions
FROM automation_log
GROUP BY teacher_id, DATE_TRUNC('month', executed_at), action_type;

-- Index for materialized view
CREATE UNIQUE INDEX idx_teacher_time_saved_summary_unique 
ON teacher_time_saved_summary(teacher_id, month, action_type);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_teacher_time_saved_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY teacher_time_saved_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_students_updated_at BEFORE UPDATE ON assignment_students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_subject_performance_updated_at BEFORE UPDATE ON cross_subject_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Calculate grade percentage on submission
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_grade_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.score IS NOT NULL AND NEW.max_score IS NOT NULL AND NEW.max_score > 0 THEN
        NEW.grade_percentage = (NEW.score / NEW.max_score) * 100;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_submission_grade_percentage BEFORE INSERT OR UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION calculate_grade_percentage();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Supabase uses RLS for access control
-- These are example policies - adjust based on your security requirements
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_subject_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_log ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (customize based on your needs)
-- Teachers can view their own profile
CREATE POLICY "Teachers can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Teachers can view all students in their assignments
CREATE POLICY "Teachers can view student profiles" ON profiles
    FOR SELECT USING (
        role = 'student' AND
        EXISTS (
            SELECT 1 FROM assignments a
            WHERE a.teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Teachers can manage their own assignments
CREATE POLICY "Teachers can manage own assignments" ON assignments
    FOR ALL USING (teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Students can view assignments assigned to them
CREATE POLICY "Students can view assigned assignments" ON assignments
    FOR SELECT USING (
        id IN (
            SELECT assignment_id FROM assignment_students
            WHERE student_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Students can manage their own submissions
CREATE POLICY "Students can manage own submissions" ON submissions
    FOR ALL USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Teachers can view submissions for their assignments
CREATE POLICY "Teachers can view submissions for their assignments" ON submissions
    FOR SELECT USING (
        assignment_id IN (
            SELECT id FROM assignments
            WHERE teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Students can view their own performance analytics
CREATE POLICY "Students can view own performance" ON cross_subject_performance
    FOR SELECT USING (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Teachers can view performance for their students
CREATE POLICY "Teachers can view student performance" ON cross_subject_performance
    FOR SELECT USING (
        student_id IN (
            SELECT DISTINCT student_id FROM assignment_students
            WHERE assignment_id IN (
                SELECT id FROM assignments
                WHERE teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            )
        )
    );

-- Teachers can view their own automation logs
CREATE POLICY "Teachers can view own automation logs" ON automation_log
    FOR SELECT USING (teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with role-based access. Primary Actors: Teachers. Secondary: Students.';
COMMENT ON TABLE assignments IS 'Assignments with curriculum alignment and task type classification. Core entity for curriculum delivery.';
COMMENT ON TABLE assignment_students IS 'Junction table linking assignments to students, enabling differentiated assignments.';
COMMENT ON TABLE submissions IS 'Student work submissions with AI-generated feedback. Core entity for tracking student performance.';
COMMENT ON TABLE cross_subject_performance IS 'Cross-subject analytics aggregating Math, Reading, and Science performance to eliminate information asymmetry.';
COMMENT ON TABLE automation_log IS 'Tracks time saved per teacher to validate Economic Logic and value proposition for Primary Actors.';
COMMENT ON MATERIALIZED VIEW teacher_time_saved_summary IS 'Monthly aggregated view of time saved metrics per teacher for Economic Logic validation.';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================