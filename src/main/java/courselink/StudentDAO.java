package courselink;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class StudentDAO {

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
}
