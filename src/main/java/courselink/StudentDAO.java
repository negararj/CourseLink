package courselink;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class StudentDAO {

    public Course registerCourse(long userId, String name, String instructor, int credits) {
        String courseCode = courseCodeFrom(name);

        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);

            try {
                Course course = findCourse(conn, name, instructor);
                if (course == null) {
                    course = createCourse(conn, name, instructor, courseCode, credits);
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

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    courses.add(courseFrom(rs));
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

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

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

        } catch (Exception e) {
            e.printStackTrace();
        }

        return alerts;
    }

    private Course findCourse(Connection conn, String name, String instructor) throws Exception {
        String query = """
                SELECT id, name, instructor, course_code, credits
                FROM courses
                WHERE LOWER(name) = LOWER(?)
                  AND LOWER(instructor) = LOWER(?)
                LIMIT 1
                """;

        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, name);
            ps.setString(2, instructor);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return courseFrom(rs);
                }
            }
        }

        return null;
    }

    private Course createCourse(Connection conn, String name, String instructor, String courseCode, int credits)
            throws Exception {
        String query = "INSERT INTO courses (name, instructor, course_code, credits) VALUES (?, ?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, instructor);
            ps.setString(3, courseCode);
            ps.setInt(4, credits);
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    Course course = new Course();
                    course.setId(keys.getInt(1));
                    course.setName(name);
                    course.setInstructor(instructor);
                    course.setCourseCode(courseCode);
                    course.setCredits(credits);
                    return course;
                }
            }
        }

        return null;
    }

    private void enrollStudent(Connection conn, long userId, int courseId) throws Exception {
        String query = """
                INSERT INTO Enrollments (user_id, course_id, status)
                VALUES (?, ?, 'active')
                ON DUPLICATE KEY UPDATE status = 'active'
                """;

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

    private String courseCodeFrom(String name) {
        String cleaned = name == null ? "" : name.trim().replaceAll("[^A-Za-z0-9]", "");
        if (cleaned.isBlank()) {
            return "COURSE";
        }

        return cleaned.length() > 12 ? cleaned.substring(0, 12).toUpperCase() : cleaned.toUpperCase();
    }
}
