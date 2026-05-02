USE courselink;

DELETE FROM Enrollments
WHERE course_id IN (
    SELECT id FROM courses
    WHERE (name = 'Intro to Programming' AND instructor = 'Dr. Smith')
       OR (name = 'Calculus II' AND instructor = 'Dr. Ahmed')
);

DELETE FROM courses
WHERE (name = 'Intro to Programming' AND instructor = 'Dr. Smith')
   OR (name = 'Calculus II' AND instructor = 'Dr. Ahmed');

SELECT id, course_code, name, instructor, credits
FROM courses;
