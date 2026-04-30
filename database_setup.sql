CREATE DATABASE IF NOT EXISTS courselink;
USE courselink;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    instructor VARCHAR(120) NOT NULL
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
