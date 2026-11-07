-- =====================================================================
-- CourseForge: Teaching Administration Management - Course Selection
-- Relational Database Schema (MySQL Compatible)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS courseforge_db;
USE courseforge_db;

-- 1. Users / Students table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_no VARCHAR(20) NOT NULL UNIQUE,      -- e.g. '2024101001'
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    major VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT' or 'ADMIN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses table
CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,  -- e.g. 'CS101', 'CS201', 'CS301'
    title VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    credits DECIMAL(3,1) NOT NULL CHECK (credits > 0),
    capacity INT NOT NULL DEFAULT 40,
    instructor VARCHAR(100) NOT NULL,
    semester VARCHAR(20) NOT NULL DEFAULT '2026-Fall',
    description TEXT
);

-- 3. Course Schedules (Day of week & Period for Time Conflict detection)
-- Day: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday
-- Periods: 1-2 (Morning 1), 3-4 (Morning 2), 5-6 (Afternoon 1), 7-8 (Afternoon 2), 9-10 (Evening)
CREATE TABLE IF NOT EXISTS course_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_period INT NOT NULL CHECK (start_period BETWEEN 1 AND 12),
    end_period INT NOT NULL CHECK (end_period >= start_period),
    classroom VARCHAR(50) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- 4. Course Prerequisites (Prerequisite Constraint Enforcement)
CREATE TABLE IF NOT EXISTS course_prerequisites (
    course_id INT NOT NULL,
    prerequisite_course_id INT NOT NULL,
    PRIMARY KEY (course_id, prerequisite_course_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- 5. Student Completed Courses / Academic History
CREATE TABLE IF NOT EXISTS student_course_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    grade VARCHAR(5) NOT NULL,               -- e.g. 'A', 'B+', 'C', 'P'
    status VARCHAR(20) NOT NULL DEFAULT 'PASSED', -- 'PASSED' or 'FAILED'
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- 6. Current Semester Enrollments (Active Selected Courses)
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL DEFAULT '2026-Fall',
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED', -- 'ENROLLED', 'DROPPED'
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_course_sem (user_id, course_id, semester),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
