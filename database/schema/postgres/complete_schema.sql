-- Complete Postgres Schema for Attendify
-- Drop everything first
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS teacher_course_class_assignments CASCADE;
DROP TABLE IF EXISTS student_course_enrollments CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;
DROP TABLE IF EXISTS class_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS attendance_statuses CASCADE;
DROP TABLE IF EXISTS user_statuses CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================
-- LOOKUP TABLES
-- =============================

CREATE TABLE roles (
  code VARCHAR(30) PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed lookup data
INSERT INTO roles (code, name) VALUES
('ADMIN','Admin'),
('TEACHER','Teacher'),
('STUDENT','Student');

INSERT INTO user_statuses (code, name) VALUES
('ACTIVE','Active'),
('SUSPENDED','Suspended'),
('INACTIVE','Inactive');

INSERT INTO attendance_statuses (code, name) VALUES
('PRESENT','Present'),
('ABSENT','Absent'),
('LATE','Late'),
('EXCUSED','Excused');

-- =============================
-- USERS
-- =============================

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  role_code VARCHAR(30) NOT NULL REFERENCES roles(code),
  status_code VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' REFERENCES user_statuses(code),

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(30),

  created_by BIGINT,
  updated_by BIGINT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by)
REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by)
REFERENCES users(id) ON DELETE SET NULL;

-- =============================
-- ACADEMIC STRUCTURE
-- =============================

CREATE TABLE departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE academic_years (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  sort_order INT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(10) UNIQUE NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id BIGSERIAL PRIMARY KEY,

  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,

  is_active BOOLEAN DEFAULT TRUE,

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (department_id, academic_year_id, section_id)
);

CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,

  code VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,

  is_active BOOLEAN DEFAULT TRUE,

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (department_id, code)
);

CREATE TABLE class_courses (
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (class_id, course_id)
);

-- =============================
-- PROFILES
-- =============================

CREATE TABLE student_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  class_id BIGINT NOT NULL REFERENCES classes(id),

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  department_id BIGINT REFERENCES departments(id),

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================
-- ENROLLMENTS / ASSIGNMENTS
-- =============================

CREATE TABLE student_course_enrollments (
  id BIGSERIAL PRIMARY KEY,

  student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (student_id, course_id, class_id)
);

CREATE TABLE teacher_course_class_assignments (
  id BIGSERIAL PRIMARY KEY,

  teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,

  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (teacher_id, course_id, class_id)
);

-- =============================
-- ATTENDANCE
-- =============================

CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,

  student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,

  attendance_date DATE NOT NULL,
  status_code VARCHAR(20) NOT NULL REFERENCES attendance_statuses(code),

  marked_by BIGINT NOT NULL REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (student_id, course_id, class_id, attendance_date)
);

-- =============================
-- REFRESH TOKENS
-- =============================

CREATE TABLE refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================
-- INDEXES
-- =============================

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

-- =============================
-- TRIGGERS (for updated_at)
-- =============================

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

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_course_class_assignments_updated_at BEFORE UPDATE ON teacher_course_class_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================
-- SEED DATA
-- =============================

-- Admin user (password: admin123)
INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_by, updated_by) VALUES
('admin@gmail.com', '$2a$12$.cHBn5fYgqoY/IEHvS93yeZ1V3m488givjclWlA0C5hNMbmmVxJv2', 'ADMIN', 'ACTIVE', 'Admin', 'User', 1, 1);

-- Departments
INSERT INTO departments (name, created_by, updated_by) VALUES
('Computer Science', 1, 1),
('Mathematics', 1, 1),
('Physics', 1, 1),
('Chemistry', 1, 1);

-- Academic Years
INSERT INTO academic_years (name, sort_order, is_active, created_by, updated_by) VALUES
('2023-2024', 1, FALSE, 1, 1),
('2024-2025', 2, TRUE, 1, 1),
('2025-2026', 3, FALSE, 1, 1);

-- Sections
INSERT INTO sections (name, created_by, updated_by) VALUES
('A', 1, 1),
('B', 1, 1),
('C', 1, 1);

-- Classes
INSERT INTO classes (department_id, academic_year_id, section_id, is_active, created_by, updated_by) VALUES
(1, 2, 1, TRUE, 1, 1), -- Computer Science, 2024-2025, Section A
(1, 2, 2, TRUE, 1, 1), -- Computer Science, 2024-2025, Section B
(2, 2, 1, TRUE, 1, 1), -- Mathematics, 2024-2025, Section A
(3, 2, 1, TRUE, 1, 1); -- Physics, 2024-2025, Section A

-- Courses
INSERT INTO courses (department_id, code, title, is_active, created_by, updated_by) VALUES
(1, 'CS101', 'Introduction to Computer Science', TRUE, 1, 1),
(1, 'CS102', 'Data Structures', TRUE, 1, 1),
(1, 'CS201', 'Algorithms', TRUE, 1, 1),
(2, 'MATH101', 'Calculus I', TRUE, 1, 1),
(2, 'MATH102', 'Calculus II', TRUE, 1, 1),
(3, 'PHY101', 'Physics I', TRUE, 1, 1),
(3, 'PHY102', 'Physics II', TRUE, 1, 1);

-- Teacher
INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_by, updated_by) VALUES
('teacher@example.com', '$2a$12$.cHBn5fYgqoY/IEHvS93yeZ1V3m488givjclWlA0C5hNMbmmVxJv2', 'TEACHER', 'ACTIVE', 'John', 'Doe', 1, 1)
RETURNING id;

-- Create teacher profile and assignments
DO $$
DECLARE
    teacher_id INTEGER;
BEGIN
    SELECT id INTO teacher_id FROM users WHERE email = 'teacher@example.com';
    
    INSERT INTO teacher_profiles (user_id, employee_number, department_id, created_by, updated_by)
    VALUES (teacher_id, 'T001', 1, 1, 1);
    
    INSERT INTO teacher_course_class_assignments (teacher_id, course_id, class_id, created_by, updated_by) VALUES
    (teacher_id, 1, 1, 1, 1), -- CS101, Class 1
    (teacher_id, 2, 1, 1, 1), -- CS102, Class 1
    (teacher_id, 1, 2, 1, 1), -- CS101, Class 2
    (teacher_id, 4, 3, 1, 1); -- MATH101, Class 3
END $$;

-- Students
INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_by, updated_by) VALUES
('student1@example.com', '$2a$12$.cHBn5fYgqoY/IEHvS93yeZ1V3m488givjclWlA0C5hNMbmmVxJv2', 'STUDENT', 'ACTIVE', 'Alice', 'Smith', 1, 1),
('student2@example.com', '$2a$12$.cHBn5fYgqoY/IEHvS93yeZ1V3m488givjclWlA0C5hNMbmmVxJv2', 'STUDENT', 'ACTIVE', 'Bob', 'Johnson', 1, 1),
('student3@example.com', '$2a$12$.cHBn5fYgqoY/IEHvS93yeZ1V3m488givjclWlA0C5hNMbmmVxJv2', 'STUDENT', 'ACTIVE', 'Charlie', 'Brown', 1, 1);

-- Student profiles
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

-- Sample attendance data
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
