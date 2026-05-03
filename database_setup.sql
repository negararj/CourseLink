CREATE DATABASE IF NOT EXISTS courselink;
USE courselink;
SET SQL_SAFE_UPDATES = 0;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    instructor VARCHAR(120) NOT NULL,
    course_code VARCHAR(40),
    credits INT NOT NULL DEFAULT 3
);

CREATE TABLE IF NOT EXISTS Assessments (
    assessment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    assessment_type VARCHAR(40) NOT NULL,
    weight_percent DECIMAL(5,2) NOT NULL,
    exam_date DATE NOT NULL,
    topic VARCHAR(255),
    instructions TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Materials (
    material_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    major VARCHAR(80),
    role ENUM('student', 'instructor') NOT NULL DEFAULT 'student',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Grades (
    grade_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    assessment_id BIGINT NOT NULL,
    score_percent DECIMAL(5,2) NOT NULL,
    graded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grades_student
        FOREIGN KEY (student_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_grades_assessment
        FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_grades_student_assessment UNIQUE (student_id, assessment_id),
    CONSTRAINT chk_grades_score CHECK (score_percent >= 0 AND score_percent <= 100)
);

CREATE TABLE IF NOT EXISTS Enrollments (
    enrollment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped') NOT NULL DEFAULT 'active',
    UNIQUE KEY unique_student_course (user_id, course_id),
    CONSTRAINT fk_enrollments_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE
);

SET @course_code_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'courses'
      AND COLUMN_NAME = 'course_code'
);
SET @sql = IF(@course_code_exists = 0,
    'ALTER TABLE courses ADD COLUMN course_code VARCHAR(40)',
    'SELECT ''course_code already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DELETE FROM courses
WHERE id IN (
    SELECT id FROM (
        SELECT id
        FROM courses
        WHERE (name = 'Intro to Programming' AND instructor = 'Dr. Smith')
           OR (name = 'Calculus II' AND instructor = 'Dr. Ahmed')
    ) AS dummy_courses
);
SET @credits_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'courses'
      AND COLUMN_NAME = 'credits'
);
SET @sql = IF(@credits_exists = 0,
    'ALTER TABLE courses ADD COLUMN credits INT NOT NULL DEFAULT 3',
    'SELECT ''credits already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
