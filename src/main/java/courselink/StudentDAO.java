package courselink;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class StudentDAO {

    public Course registerCourse(long userId, int courseId) {
        try (Connection conn = DBConnection.getConnection()) {
            ensureStudentSchema(conn);
            conn.setAutoCommit(false);

            try {
                Course course = findCourse(conn, courseId);
                if (course == null) {
                    conn.rollback();
                    return null;
                }

                enrollStudent(conn, userId, course.getId());
                conn.commit();
                return course;

            } catch (Exception e) {
                conn.rollback();
                throw e;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public List<Course> getEnrolledCourses(long userId) {
        List<Course> courses = new ArrayList<>();
        String query = """
                SELECT c.id, c.name, c.instructor, c.course_code, c.credits
                FROM Enrollments e
                JOIN courses c ON c.id = e.course_id
                WHERE e.user_id = ?
                  AND e.status = 'active'
                ORDER BY c.name
                """;

        try (Connection conn = DBConnection.getConnection()) {
            ensureStudentSchema(conn);

            try (PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        courses.add(courseFrom(rs));
                    }
                }
            }


        } catch (Exception e) {
            e.printStackTrace();
        }

        return courses;
    }

    public List<Map<String, Object>> getUpcomingAlerts(long userId) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        String query = """
                SELECT a.assessment_id, a.title, a.assessment_type, a.exam_date,
                       a.topic, c.name AS course_name, c.course_code
                FROM Enrollments e
                JOIN courses c ON c.id = e.course_id
                JOIN Assessments a
                  ON a.course_id = CAST(c.id AS CHAR)
                  OR a.course_id = c.course_code
                  OR a.course_id = c.name
                WHERE e.user_id = ?
                  AND e.status = 'active'
                  AND a.is_published = TRUE
                  AND a.exam_date >= CURDATE()
                ORDER BY a.exam_date
                LIMIT 5
                """;

        try (Connection conn = DBConnection.getConnection()) {
            ensureStudentSchema(conn);

            try (PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> alert = new LinkedHashMap<>();
                        Date examDate = rs.getDate("exam_date");

                        alert.put("id", rs.getLong("assessment_id"));
                        alert.put("type", rs.getString("assessment_type"));
                        alert.put("title", rs.getString("title"));
                        alert.put("courseName", rs.getString("course_name"));
                        alert.put("courseCode", rs.getString("course_code"));
                        alert.put("date", examDate == null ? null : examDate.toLocalDate().toString());
                        alert.put("topic", rs.getString("topic"));
                        alert.put("description", descriptionFor(rs));
                        alerts.add(alert);
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return alerts;
    }

    public Map<String, Object> getGradeSummary(long userId) {
        Map<Integer, CourseGrade> courseGrades = new LinkedHashMap<>();
        String query = """
                SELECT c.id, c.credits, a.assessment_id, a.weight_percent, g.score_percent
                FROM Enrollments e
                JOIN courses c ON c.id = e.course_id
                LEFT JOIN Assessments a
                  ON (a.course_id = CAST(c.id AS CHAR)
                  OR a.course_id = c.course_code
                  OR a.course_id = c.name)
                  AND a.is_published = TRUE
                LEFT JOIN Grades g
                  ON g.assessment_id = a.assessment_id
                  AND g.student_id = e.user_id
                WHERE e.user_id = ?
                  AND e.status = 'active'
                ORDER BY c.id, a.assessment_id
                """;

        try (Connection conn = DBConnection.getConnection()) {
            ensureStudentSchema(conn);

            try (PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setLong(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        int courseId = rs.getInt("id");
                        CourseGrade courseGrade = courseGrades.get(courseId);
                        if (courseGrade == null) {
                            courseGrade = new CourseGrade(rs.getInt("credits"));
                            courseGrades.put(courseId, courseGrade);
                        }

                        if (rs.getObject("assessment_id") == null) {
                            continue;
                        }

                        double weight = rs.getDouble("weight_percent");
                        double score = rs.getDouble("score_percent");
                        if (!rs.wasNull()) {
                            courseGrade.earnedPercent += score * weight / 100.0;
                            courseGrade.gradedWeight += weight;
                        }
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        double weightedPercentTotal = 0.0;
        double weightedGpaTotal = 0.0;
        int gradedCredits = 0;

        for (CourseGrade courseGrade : courseGrades.values()) {
            if (courseGrade.gradedWeight == 0.0) {
                continue;
            }

            double courseAverage = courseGrade.earnedPercent / courseGrade.gradedWeight * 100.0;
            int credits = Math.max(1, courseGrade.credits);
            weightedPercentTotal += courseAverage * credits;
            weightedGpaTotal += percentToGpa(courseAverage) * credits;
            gradedCredits += credits;
        }

        double averageGrade = gradedCredits == 0 ? 0.0 : weightedPercentTotal / gradedCredits;
        double cgpa = gradedCredits == 0 ? 0.0 : weightedGpaTotal / gradedCredits;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("averageGrade", round(averageGrade));
        summary.put("cgpa", round(cgpa));
        summary.put("gradedCredits", gradedCredits);
        return summary;
    }

    public List<Map<String, Object>> getClassmates(long userId, int courseId) {
        List<Map<String, Object>> classmates = new ArrayList<>();
        String query = """
                SELECT u.user_id, u.first_name, u.last_name, u.email, u.major
                FROM Enrollments e
                JOIN Users u ON u.user_id = e.user_id
                WHERE e.course_id = ?
                  AND e.status = 'active'
                  AND u.role = 'student'
                  AND u.user_id <> ?
                ORDER BY u.first_name, u.last_name
                """;

        try (Connection conn = DBConnection.getConnection()) {
            ensureStudentSchema(conn);

            try (PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setInt(1, courseId);
                ps.setLong(2, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> classmate = new LinkedHashMap<>();
                        classmate.put("id", rs.getLong("user_id"));
                        classmate.put("firstName", rs.getString("first_name"));
                        classmate.put("lastName", rs.getString("last_name"));
                        classmate.put("fullName", fullName(rs));
                        classmate.put("email", rs.getString("email"));
                        classmate.put("major", rs.getString("major"));
                        classmates.add(classmate);
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return classmates;
    }

    private Course findCourse(Connection conn, int courseId) throws Exception {
        String query = """
                SELECT id, name, instructor, course_code, credits
                FROM courses
                WHERE id = ?
                LIMIT 1
                """;

        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, courseId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return courseFrom(rs);
                }
            }
        }

        return null;
    }

    private void enrollStudent(Connection conn, long userId, int courseId) throws Exception {
        String update = "UPDATE Enrollments SET status = 'active' WHERE user_id = ? AND course_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(update)) {
            ps.setLong(1, userId);
            ps.setInt(2, courseId);
            if (ps.executeUpdate() > 0) {
                return;
            }
        }

        String query = "INSERT INTO Enrollments (user_id, course_id, status) VALUES (?, ?, 'active')";
        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setLong(1, userId);
            ps.setInt(2, courseId);
            ps.executeUpdate();
        }
    }

    private Course courseFrom(ResultSet rs) throws Exception {
        Course course = new Course();
        course.setId(rs.getInt("id"));
        course.setName(rs.getString("name"));
        course.setInstructor(rs.getString("instructor"));
        course.setCourseCode(rs.getString("course_code"));
        course.setCredits(rs.getInt("credits"));
        return course;
    }

    private String descriptionFor(ResultSet rs) throws Exception {
        String courseName = rs.getString("course_name");
        String type = rs.getString("assessment_type");
        String topic = rs.getString("topic");

        if (topic == null || topic.isBlank()) {
            return courseName + " has an upcoming " + type + ".";
        }

        return courseName + " has an upcoming " + type + " on " + topic + ".";
    }

    private String fullName(ResultSet rs) throws Exception {
        String firstName = rs.getString("first_name");
        String lastName = rs.getString("last_name");
        return ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
    }

    private void ensureStudentSchema(Connection conn) throws Exception {
        if (!columnExists(conn, "courses", "course_code")) {
            execute(conn, "ALTER TABLE courses ADD COLUMN course_code VARCHAR(40)");
        }

        if (!columnExists(conn, "courses", "credits")) {
            execute(conn, "ALTER TABLE courses ADD COLUMN credits INT NOT NULL DEFAULT 3");
        }

        if (!tableExists(conn, "Enrollments")) {
            execute(conn, """
                    CREATE TABLE Enrollments (
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
                    )
                    """);
        }

        if (!tableExists(conn, "Grades")) {
            execute(conn, """
                    CREATE TABLE Grades (
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
                    )
                    """);
        }
    }

    private double percentToGpa(double percent) {
        return Math.max(0.0, Math.min(4.0, percent / 25.0));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static class CourseGrade {
        private final int credits;
        private double earnedPercent;
        private double gradedWeight;

        private CourseGrade(int credits) {
            this.credits = credits;
        }
    }

    private boolean tableExists(Connection conn, String tableName) throws Exception {
        DatabaseMetaData metaData = conn.getMetaData();
        try (ResultSet rs = metaData.getTables(conn.getCatalog(), null, tableName, new String[] {"TABLE"})) {
            if (rs.next()) {
                return true;
            }
        }

        try (ResultSet rs = metaData.getTables(conn.getCatalog(), null, tableName.toLowerCase(), new String[] {"TABLE"})) {
            return rs.next();
        }
    }

    private boolean columnExists(Connection conn, String tableName, String columnName) throws Exception {
        DatabaseMetaData metaData = conn.getMetaData();
        try (ResultSet rs = metaData.getColumns(conn.getCatalog(), null, tableName, columnName)) {
            if (rs.next()) {
                return true;
            }
        }

        try (ResultSet rs = metaData.getColumns(conn.getCatalog(), null, tableName.toLowerCase(), columnName)) {
            return rs.next();
        }
    }

    private void execute(Connection conn, String sql) throws Exception {
        try (Statement statement = conn.createStatement()) {
            statement.execute(sql);
        }
    }
}
