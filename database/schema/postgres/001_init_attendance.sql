-- Postgres version of attendance schema
-- Drop tables in correct order (due to foreign keys)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS teacher_course_class_assignments CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;
DROP TABLE IF EXISTS class_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_code user_role NOT NULL DEFAULT 'STUDENT',
  status_code user_status NOT NULL DEFAULT 'ACTIVE',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Departments
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Academic Years
CREATE TABLE academic_years (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Sections
CREATE TABLE sections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Classes
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
  section_id INTEGER NOT NULL REFERENCES sections(id),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(department_id, academic_year_id, section_id)
);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  code VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(department_id, code)
);

-- Class-Course mapping
CREATE TABLE class_courses (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(class_id, course_id)
);

-- Teacher Profiles
CREATE TABLE teacher_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  employee_number VARCHAR(50),
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Student Profiles
CREATE TABLE student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  student_number VARCHAR(50),
  class_id INTEGER REFERENCES classes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

-- Teacher-Course-Class Assignments
CREATE TABLE teacher_course_class_assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  class_id INTEGER NOT NULL REFERENCES classes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(teacher_id, course_id, class_id)
);

-- Attendance
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  class_id INTEGER NOT NULL REFERENCES classes(id),
  attendance_date DATE NOT NULL,
  status_code attendance_status NOT NULL DEFAULT 'PRESENT',
  marked_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, class_id, attendance_date)
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  jti VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_code);
CREATE INDEX idx_users_status ON users(status_code);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_course ON attendance(course_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_courses_updated_at BEFORE UPDATE ON class_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_course_class_assignments_updated_at BEFORE UPDATE ON teacher_course_class_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO departments (name, created_by, updated_by) VALUES
('Computer Science', 1, 1),
('Mathematics', 1, 1),
('Physics', 1, 1),
('Chemistry', 1, 1);

INSERT INTO academic_years (name, sort_order, is_active, created_by, updated_by) VALUES
('2023-2024', 1, FALSE, 1, 1),
('2024-2025', 2, TRUE, 1, 1),
('2025-2026', 3, FALSE, 1, 1);

INSERT INTO sections (name, created_by, updated_by) VALUES
('A', 1, 1),
('B', 1, 1),
('C', 1, 1);

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_by, updated_by) VALUES
('admin@gmail.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'ADMIN', 'ACTIVE', 'Admin', 'User', 1, 1);

-- Create sample departments, academic years, sections already done above
-- Create sample classes
INSERT INTO classes (department_id, academic_year_id, section_id, is_active, created_by, updated_by) VALUES
(1, 2, 1, TRUE, 1, 1), -- Computer Science, 2024-2025, Section A
(1, 2, 2, TRUE, 1, 1), -- Computer Science, 2024-2025, Section B
(2, 2, 1, TRUE, 1, 1), -- Mathematics, 2024-2025, Section A
(3, 2, 1, TRUE, 1, 1); -- Physics, 2024-2025, Section A

-- Create sample courses
INSERT INTO courses (department_id, code, title, is_active, created_by, updated_by) VALUES
(1, 'CS101', 'Introduction to Computer Science', TRUE, 1, 1),
(1, 'CS102', 'Data Structures', TRUE, 1, 1),
(1, 'CS201', 'Algorithms', TRUE, 1, 1),
(2, 'MATH101', 'Calculus I', TRUE, 1, 1),
(2, 'MATH102', 'Calculus II', TRUE, 1, 1),
(3, 'PHY101', 'Physics I', TRUE, 1, 1),
(3, 'PHY102', 'Physics II', TRUE, 1, 1);

-- Create sample teacher
INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_by, updated_by) VALUES
('teacher@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'TEACHER', 'ACTIVE', 'John', 'Doe', 1, 1)
RETURNING id;

-- Get teacher ID for next steps
DO $$
DECLARE
    teacher_id INTEGER;
BEGIN
    SELECT id INTO teacher_id FROM users WHERE email = 'teacher@example.com';
    
    -- Create teacher profile
    INSERT INTO teacher_profiles (user_id, employee_number, department_id, created_by, updated_by)
    VALUES (teacher_id, 'T001', 1, 1, 1);
    
    -- Assign teacher to courses and classes
    INSERT INTO teacher_course_class_assignments (teacher_id, course_id, class_id, created_by, updated_by) VALUES
    (teacher_id, 1, 1, 1, 1), -- CS101, Class 1
    (teacher_id, 2, 1, 1, 1), -- CS102, Class 1
    (teacher_id, 1, 2, 1, 1), -- CS101, Class 2
    (teacher_id, 4, 3, 1, 1); -- MATH101, Class 3
END $$;

-- Create sample students
INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_by, updated_by) VALUES
('student1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'STUDENT', 'ACTIVE', 'Alice', 'Smith', 1, 1),
('student2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'STUDENT', 'ACTIVE', 'Bob', 'Johnson', 1, 1),
('student3@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'STUDENT', 'ACTIVE', 'Charlie', 'Brown', 1, 1);

-- Create student profiles
DO $$
DECLARE
    student_id INTEGER;
BEGIN
    -- Student 1
    SELECT id INTO student_id FROM users WHERE email = 'student1@example.com';
    INSERT INTO student_profiles (user_id, student_number, class_id, created_by, updated_by)
    VALUES (student_id, 'STU001', 1, 1, 1);
    
    -- Student 2
    SELECT id INTO student_id FROM users WHERE email = 'student2@example.com';
    INSERT INTO student_profiles (user_id, student_number, class_id, created_by, updated_by)
    VALUES (student_id, 'STU002', 1, 1, 1);
    
    -- Student 3
    SELECT id INTO student_id FROM users WHERE email = 'student3@example.com';
    INSERT INTO student_profiles (user_id, student_number, class_id, created_by, updated_by)
    VALUES (student_id, 'STU003', 2, 1, 1);
END $$;

-- Create sample attendance data
DO $$
DECLARE
    student_id INTEGER;
    teacher_id INTEGER;
BEGIN
    SELECT id INTO teacher_id FROM users WHERE email = 'teacher@example.com';
    
    -- Student 1 attendance
    SELECT id INTO student_id FROM users WHERE email = 'student1@example.com';
    INSERT INTO attendance (student_id, course_id, class_id, attendance_date, status_code, marked_by) VALUES
    (student_id, 1, 1, CURRENT_DATE - INTERVAL '2 days', 'PRESENT', teacher_id),
    (student_id, 2, 1, CURRENT_DATE - INTERVAL '2 days', 'PRESENT', teacher_id),
    (student_id, 1, 1, CURRENT_DATE - INTERVAL '1 day', 'LATE', teacher_id);
    
    -- Student 2 attendance
    SELECT id INTO student_id FROM users WHERE email = 'student2@example.com';
    INSERT INTO attendance (student_id, course_id, class_id, attendance_date, status_code, marked_by) VALUES
    (student_id, 1, 1, CURRENT_DATE - INTERVAL '2 days', 'PRESENT', teacher_id),
    (student_id, 2, 1, CURRENT_DATE - INTERVAL '2 days', 'ABSENT', teacher_id),
    (student_id, 1, 1, CURRENT_DATE - INTERVAL '1 day', 'PRESENT', teacher_id);
    
    -- Student 3 attendance
    SELECT id INTO student_id FROM users WHERE email = 'student3@example.com';
    INSERT INTO attendance (student_id, course_id, class_id, attendance_date, status_code, marked_by) VALUES
    (student_id, 1, 2, CURRENT_DATE - INTERVAL '2 days', 'PRESENT', teacher_id),
    (student_id, 1, 2, CURRENT_DATE - INTERVAL '1 day', 'EXCUSED', teacher_id);
END $$;
