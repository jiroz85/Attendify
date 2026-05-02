-- =============================
-- SMART ATTENDANCE TRACKING SYSTEM (SaaS-ready)
-- MySQL 8.x / InnoDB
-- =============================
-- Create Database
CREATE DATABASE IF NOT EXISTS attendance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE attendance;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================
-- 0) LOOKUP TABLES (data quality + extensibility)
-- =============================

CREATE TABLE IF NOT EXISTS roles (
  code VARCHAR(30) NOT NULL,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (code),
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_statuses (
  code VARCHAR(20) NOT NULL,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (code),
  UNIQUE KEY uq_user_statuses_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_statuses (
  code VARCHAR(20) NOT NULL,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (code),
  UNIQUE KEY uq_attendance_statuses_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default values (extensible later)
INSERT IGNORE INTO roles (code, name) VALUES
('ADMIN', 'Admin'),
('TEACHER', 'Teacher'),
('STUDENT', 'Student');

INSERT IGNORE INTO user_statuses (code, name) VALUES
('ACTIVE', 'Active'),
('SUSPENDED', 'Suspended'),
('DELETED', 'Deleted');

INSERT IGNORE INTO attendance_statuses (code, name) VALUES
('PRESENT', 'Present'),
('ABSENT', 'Absent'),
('LATE', 'Late'),
('EXCUSED', 'Excused');

-- =============================
-- 1) ACADEMIC STRUCTURE
-- =============================

CREATE TABLE IF NOT EXISTS departments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_name (name),
  KEY idx_departments_created_by (created_by),
  KEY idx_departments_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS academic_years (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  sort_order INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_academic_years_name (name),
  UNIQUE KEY uq_academic_years_sort_order (sort_order),
  KEY idx_academic_years_created_by (created_by),
  KEY idx_academic_years_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(10) NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sections_name (name),
  KEY idx_sections_created_by (created_by),
  KEY idx_sections_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS classes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_id BIGINT UNSIGNED NOT NULL,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  section_id BIGINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  UNIQUE KEY uq_classes_combo (department_id, academic_year_id, section_id),
  KEY idx_classes_department (department_id),
  KEY idx_classes_year (academic_year_id),
  KEY idx_classes_section (section_id),
  KEY idx_classes_created_by (created_by),
  KEY idx_classes_updated_by (updated_by),

  CONSTRAINT fk_classes_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_classes_academic_year
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_classes_section
    FOREIGN KEY (section_id) REFERENCES sections(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  UNIQUE KEY uq_courses_dept_code (department_id, code),
  KEY idx_courses_department (department_id),
  KEY idx_courses_created_by (created_by),
  KEY idx_courses_updated_by (updated_by),

  CONSTRAINT fk_courses_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_courses (
  class_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, course_id),

  KEY idx_class_courses_course (course_id),
  KEY idx_class_courses_created_by (created_by),
  KEY idx_class_courses_updated_by (updated_by),

  CONSTRAINT fk_class_courses_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_class_courses_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================
-- 2) USERS (unified)
-- =============================

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  role_code VARCHAR(30) NOT NULL,
  status_code VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,

  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role_code),
  KEY idx_users_status (status_code),
  KEY idx_users_created_by (created_by),
  KEY idx_users_updated_by (updated_by),

  CONSTRAINT fk_users_role
    FOREIGN KEY (role_code) REFERENCES roles(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_users_status
    FOREIGN KEY (status_code) REFERENCES user_statuses(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_users_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_users_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now that users exists, add audit FKs for academic tables
SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_departments_created_by'
  ),
  'SELECT 1',
  'ALTER TABLE departments ADD CONSTRAINT fk_departments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_departments_updated_by'
  ),
  'SELECT 1',
  'ALTER TABLE departments ADD CONSTRAINT fk_departments_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_academic_years_created_by'
  ),
  'SELECT 1',
  'ALTER TABLE academic_years ADD CONSTRAINT fk_academic_years_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_academic_years_updated_by'
  ),
  'SELECT 1',
  'ALTER TABLE academic_years ADD CONSTRAINT fk_academic_years_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_sections_created_by'
  ),
  'SELECT 1',
  'ALTER TABLE sections ADD CONSTRAINT fk_sections_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_sections_updated_by'
  ),
  'SELECT 1',
  'ALTER TABLE sections ADD CONSTRAINT fk_sections_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_classes_created_by'
  ),
  'SELECT 1',
  'ALTER TABLE classes ADD CONSTRAINT fk_classes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_classes_updated_by'
  ),
  'SELECT 1',
  'ALTER TABLE classes ADD CONSTRAINT fk_classes_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_courses_created_by'
  ),
  'SELECT 1',
  'ALTER TABLE courses ADD CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_courses_updated_by'
  ),
  'SELECT 1',
  'ALTER TABLE courses ADD CONSTRAINT fk_courses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_class_courses_created_by'
  ),
  'SELECT 1',
  'ALTER TABLE class_courses ADD CONSTRAINT fk_class_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS(
    SELECT 1 FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_class_courses_updated_by'
  ),
  'SELECT 1',
  'ALTER TABLE class_courses ADD CONSTRAINT fk_class_courses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =============================
-- 3) PROFILES
-- =============================

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  student_number VARCHAR(50) NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),

  UNIQUE KEY uq_student_profiles_student_number (student_number),
  KEY idx_student_profiles_class (class_id),
  KEY idx_student_profiles_created_by (created_by),
  KEY idx_student_profiles_updated_by (updated_by),

  CONSTRAINT fk_student_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_student_profiles_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_student_profiles_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_student_profiles_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  employee_number VARCHAR(50) NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),

  UNIQUE KEY uq_teacher_profiles_employee_number (employee_number),
  KEY idx_teacher_profiles_department (department_id),
  KEY idx_teacher_profiles_created_by (created_by),
  KEY idx_teacher_profiles_updated_by (updated_by),

  CONSTRAINT fk_teacher_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_teacher_profiles_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_teacher_profiles_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_teacher_profiles_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================
-- 4) ENROLLMENTS / ASSIGNMENTS
-- =============================

CREATE TABLE IF NOT EXISTS student_course_enrollments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  UNIQUE KEY uq_student_course (student_id, course_id, class_id),
  KEY idx_enroll_student (student_id),
  KEY idx_enroll_course (course_id),
  KEY idx_enroll_class (class_id),
  KEY idx_enroll_created_by (created_by),
  KEY idx_enroll_updated_by (updated_by),

  CONSTRAINT fk_enroll_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_enroll_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_enroll_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_enroll_class_course
    FOREIGN KEY (class_id, course_id) REFERENCES class_courses(class_id, course_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_enroll_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_enroll_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teacher_course_class_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  teacher_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  UNIQUE KEY uq_teacher_course_class (teacher_id, course_id, class_id),
  KEY idx_assign_teacher (teacher_id),
  KEY idx_assign_course (course_id),
  KEY idx_assign_class (class_id),
  KEY idx_assign_created_by (created_by),
  KEY idx_assign_updated_by (updated_by),

  CONSTRAINT fk_assign_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_assign_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_assign_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_assign_class_course
    FOREIGN KEY (class_id, course_id) REFERENCES class_courses(class_id, course_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_assign_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_assign_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================
-- 5) ATTENDANCE
-- =============================

CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,

  attendance_date DATE NOT NULL,
  status_code VARCHAR(20) NOT NULL,

  marked_by BIGINT UNSIGNED NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  UNIQUE KEY uq_attendance_dedupe (student_id, course_id, class_id, attendance_date),

  KEY idx_att_course_date (course_id, attendance_date),
  KEY idx_att_class_date (class_id, attendance_date),
  KEY idx_att_student_date (student_id, attendance_date),
  KEY idx_att_marked_by (marked_by),

  CONSTRAINT fk_att_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_att_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_att_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_att_marked_by
    FOREIGN KEY (marked_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_att_status
    FOREIGN KEY (status_code) REFERENCES attendance_statuses(code)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_att_class_course
    FOREIGN KEY (class_id, course_id) REFERENCES class_courses(class_id, course_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
