package courselink.servlet;

import courselink.DBConnection;
import courselink.dao.*;
import courselink.model.*;
import courselink.util.PasswordUtil;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/GradeTrackerServlet")
public class GradeTrackerServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String course = request.getParameter("course");
        double targetGrade = parseTargetGrade(request.getParameter("target"), 90.0);
        Long studentId = getStudentId(request.getSession(false));

        if (course == null || course.isBlank()) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, error("Missing course parameter."));
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            ensureGradesTable(conn);

            String trimmedCourse = course.trim();
            List<Map<String, Object>> assessments = new ArrayList<>();
            double earnedPercent = 0.0;
            double gradedWeight = 0.0;
            double totalWeight = 0.0;

            try (PreparedStatement ps = conn.prepareStatement(gradeQuery())) {
                ps.setLong(1, studentId == null ? -1L : studentId);
                ps.setString(2, trimmedCourse);
                ps.setString(3, trimmedCourse);
                ps.setString(4, trimmedCourse);
                ps.setString(5, trimmedCourse);

                ResultSet rs = ps.executeQuery();
                while (rs.next()) {
                    double weight = rs.getDouble("weight_percent");
                    Double score = nullableDouble(rs, "score_percent");

                    totalWeight += weight;
                    if (score != null) {
                        earnedPercent += score * weight / 100.0;
                        gradedWeight += weight;
                    }

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", rs.getLong("assessment_id"));
                    item.put("courseId", rs.getString("course_id"));
                    item.put("title", rs.getString("title"));
                    item.put("type", rs.getString("assessment_type"));
                    item.put("weightPercent", weight);
                    item.put("date", rs.getString("exam_date"));
                    item.put("scorePercent", score);
                    assessments.add(item);
                }
            }

            double remainingWeight = Math.max(0.0, totalWeight - gradedWeight);
            double currentAverage = gradedWeight == 0.0 ? 0.0 : earnedPercent / gradedWeight * 100.0;
            double maxAchievable = earnedPercent + remainingWeight;
            Double requiredOnRemaining = remainingWeight == 0.0
                    ? null
                    : (targetGrade - earnedPercent) / remainingWeight * 100.0;

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("course", trimmedCourse);
            payload.put("targetGrade", targetGrade);
            payload.put("assessments", assessments);
            payload.put("currentAverage", round(currentAverage));
            payload.put("earnedPercent", round(earnedPercent));
            payload.put("gradedWeight", round(gradedWeight));
            payload.put("remainingWeight", round(remainingWeight));
            payload.put("maxAchievable", round(maxAchievable));
            payload.put("requiredOnRemaining", requiredOnRemaining == null ? null : round(requiredOnRemaining));

            sendJson(response, HttpServletResponse.SC_OK, payload);

        } catch (Exception e) {
            e.printStackTrace();
            sendJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, error("Could not load grade data."));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Long studentId = getStudentId(request.getSession(false));
        if (studentId == null) {
            sendJson(response, HttpServletResponse.SC_UNAUTHORIZED, error("Please log in as a student."));
            return;
        }

        String assessmentValue = request.getParameter("assessmentId");
        String scoreValue = request.getParameter("score");

        if (assessmentValue == null || assessmentValue.isBlank()) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, error("Missing assessment id."));
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            ensureGradesTable(conn);
            long assessmentId = Long.parseLong(assessmentValue);

            if (scoreValue == null || scoreValue.isBlank()) {
                deleteGrade(conn, studentId, assessmentId);
            } else {
                double score = Double.parseDouble(scoreValue);
                if (score < 0 || score > 100) {
                    sendJson(response, HttpServletResponse.SC_BAD_REQUEST, error("Score must be between 0 and 100."));
                    return;
                }
                saveGrade(conn, studentId, assessmentId, score);
            }

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("success", true);
            sendJson(response, HttpServletResponse.SC_OK, payload);

        } catch (NumberFormatException e) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, error("Invalid grade value."));
        } catch (Exception e) {
            e.printStackTrace();
            sendJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, error("Could not save grade."));
        }
    }

    private String gradeQuery() {
        return "SELECT a.assessment_id, a.course_id, a.title, a.assessment_type, " +
                "a.weight_percent, a.exam_date, g.score_percent " +
                "FROM Assessments a " +
                "LEFT JOIN Grades g ON g.assessment_id = a.assessment_id AND g.student_id = ? " +
                "LEFT JOIN courses c ON CAST(c.id AS CHAR) = a.course_id " +
                "OR c.course_code = a.course_id " +
                "OR c.name = a.course_id " +
                "WHERE a.is_published = true " +
                "AND (a.course_id = ? OR c.name = ? OR c.course_code = ? OR CAST(c.id AS CHAR) = ?) " +
                "ORDER BY a.exam_date, a.assessment_id";
    }

    private void ensureGradesTable(Connection conn) throws Exception {
        String sql = "CREATE TABLE IF NOT EXISTS Grades (" +
                "grade_id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "student_id BIGINT NOT NULL, " +
                "assessment_id BIGINT NOT NULL, " +
                "score_percent DECIMAL(5,2) NOT NULL, " +
                "graded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE, " +
                "CONSTRAINT fk_grades_assessment FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id) ON DELETE CASCADE, " +
                "CONSTRAINT uq_grades_student_assessment UNIQUE (student_id, assessment_id), " +
                "CONSTRAINT chk_grades_score CHECK (score_percent >= 0 AND score_percent <= 100)" +
                ")";

        try (java.sql.Statement statement = conn.createStatement()) {
            statement.execute(sql);
        }
    }

    private void saveGrade(Connection conn, long studentId, long assessmentId, double score) throws Exception {
        String sql = "INSERT INTO Grades (student_id, assessment_id, score_percent) " +
                "VALUES (?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE score_percent = VALUES(score_percent), graded_at = CURRENT_TIMESTAMP";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, studentId);
            ps.setLong(2, assessmentId);
            ps.setDouble(3, score);
            ps.executeUpdate();
        }
    }

    private void deleteGrade(Connection conn, long studentId, long assessmentId) throws Exception {
        String sql = "DELETE FROM Grades WHERE student_id = ? AND assessment_id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, studentId);
            ps.setLong(2, assessmentId);
            ps.executeUpdate();
        }
    }

    private Long getStudentId(HttpSession session) {
        if (session == null) {
            return null;
        }

        Object userId = session.getAttribute("userId");
        if (userId instanceof Number) {
            return ((Number) userId).longValue();
        }
        if (userId instanceof String) {
            try {
                return Long.parseLong((String) userId);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Double nullableDouble(ResultSet rs, String column) throws Exception {
        double value = rs.getDouble(column);
        return rs.wasNull() ? null : value;
    }

    private double parseTargetGrade(String value, double fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }

    private void sendJson(HttpServletResponse response, int status, Object payload) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(gson.toJson(payload));
    }
}
