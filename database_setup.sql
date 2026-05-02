CREATE DATABASE IF NOT EXISTS courselink;
USE courselink;

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

ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS course_code VARCHAR(40);

ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS credits INT NOT NULL DEFAULT 3;

INSERT INTO courses (name, instructor)
SELECT 'Intro to Programming', 'Dr. Smith'
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE name = 'Intro to Programming'
);

INSERT INTO courses (name, instructor)
SELECT 'Calculus II', 'Dr. Ahmed'
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE name = 'Calculus II'
);

UPDATE courses
SET course_code = 'CS101', credits = 3
WHERE name = 'Intro to Programming';

UPDATE courses
SET course_code = 'MATH202', credits = 4
WHERE name = 'Calculus II';

INSERT INTO Enrollments (user_id, course_id)
SELECT u.user_id, c.id
FROM Users u
JOIN courses c ON c.name IN ('Intro to Programming', 'Calculus II')
WHERE u.role = 'student'
  AND NOT EXISTS (
      SELECT 1
      FROM Enrollments e
      WHERE e.user_id = u.user_id
        AND e.course_id = c.id
  );
