-- =====================================================
-- Quiz System Database Schema
-- Scalable design for 1M+ students
-- =====================================================

-- Table: quizzes
-- Stores quiz metadata and generated questions
-- =====================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    topic VARCHAR(255) NOT NULL,
    quiz_type VARCHAR(20) NOT NULL CHECK (quiz_type IN ('OVERALL', 'CUSTOMIZED')),
    questions JSONB NOT NULL,
    number_of_questions INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: quiz_assignments
-- Tracks which student is assigned which quiz
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    score INTEGER,
    total_questions INTEGER,
    answers JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quiz_id, student_id)
);

-- =====================================================
-- Indexes for Performance (Scalability)
-- =====================================================

-- Index for teacher's quizzes (teacher dashboard)
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_id ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_created ON quizzes(teacher_id, created_at DESC);

-- Index for quiz assignments (student view)
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_student_id ON quiz_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_student_status ON quiz_assignments(student_id, status);

-- Index for quiz assignments (teacher view)
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz_id ON quiz_assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_teacher_id ON quiz_assignments(teacher_id);

-- Composite index for assignment lookup
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz_student ON quiz_assignments(quiz_id, student_id);

-- =====================================================
-- Partial Indexes for Common Queries
-- =====================================================

-- Pending quizzes for students
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_pending ON quiz_assignments(student_id, created_at DESC)
WHERE status = 'PENDING';

-- Completed quizzes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_completed ON quiz_assignments(student_id, completed_at DESC)
WHERE status = 'COMPLETED';

-- =====================================================
-- Topics Table (Optional - for dropdown)
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, name)
);

-- Index for teacher's topics
CREATE INDEX IF NOT EXISTS idx_quiz_topics_teacher_id ON quiz_topics(teacher_id);

-- =====================================================
-- Functions for updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_assignments_updated_at
    BEFORE UPDATE ON quiz_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Performance Optimizations
-- =====================================================

-- Analyze tables for query optimizer
ANALYZE quizzes;
ANALYZE quiz_assignments;
ANALYZE quiz_topics;
