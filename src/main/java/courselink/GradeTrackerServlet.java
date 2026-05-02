package courselink;

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

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(gradeQuery())) {

            String trimmedCourse = course.trim();
            ps.setLong(1, studentId == null ? -1L : studentId);
            ps.setString(2, trimmedCourse);
            ps.setString(3, courseIdForName(trimmedCourse));
            ps.setString(4, courseCodeForName(trimmedCourse));

            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> assessments = new ArrayList<>();
            double earnedPercent = 0.0;
            double gradedWeight = 0.0;
            double totalWeight = 0.0;

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

    private String gradeQuery() {
        return "SELECT a.assessment_id, a.course_id, a.title, a.assessment_type, " +
                "a.weight_percent, a.exam_date, g.score_percent " +
                "FROM Assessments a " +
                "LEFT JOIN Grades g ON g.assessment_id = a.assessment_id AND g.student_id = ? " +
                "WHERE a.is_published = true " +
                "AND (a.course_id = ? OR a.course_id = (" +
                "SELECT CAST(c.id AS CHAR) FROM courses c WHERE c.name = ? LIMIT 1" +
                ") OR a.course_id = ?) " +
                "ORDER BY a.exam_date, a.assessment_id";
    }

    private String courseIdForName(String course) {
        return course;
    }

    private String courseCodeForName(String course) {
        if ("Intro to Programming".equalsIgnoreCase(course)) {
            return "CMP120";
        }
        if ("Calculus II".equalsIgnoreCase(course)) {
            return "MTH104";
        }
        return course;
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
