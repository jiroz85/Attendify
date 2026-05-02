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

-- Seed data
INSERT INTO roles (code, name) VALUES
('ADMIN','Admin'),
('TEACHER','Teacher'),
('STUDENT','Student')
ON CONFLICT DO NOTHING;

INSERT INTO user_statuses (code, name) VALUES
('ACTIVE','Active'),
('SUSPENDED','Suspended'),
('DELETED','Deleted')
ON CONFLICT DO NOTHING;

INSERT INTO attendance_statuses (code, name) VALUES
('PRESENT','Present'),
('ABSENT','Absent'),
('LATE','Late'),
('EXCUSED','Excused')
ON CONFLICT DO NOTHING;

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