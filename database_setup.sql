CREATE DATABASE IF NOT EXISTS courselink;
USE courselink;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    instructor VARCHAR(120) NOT NULL
);

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS course_code VARCHAR(40) NULL AFTER id;

DELETE FROM courses
WHERE (name = 'Intro to Programming' AND instructor = 'Dr. Smith')
   OR (name = 'Calculus II' AND instructor = 'Dr. Ahmed');

UPDATE courses
SET course_code = CONCAT('COURSE', id)
WHERE course_code IS NULL OR course_code = '';

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
