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

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/CalendarServlet")
public class CalendarServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String course = request.getParameter("course");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(calendarQuery(course))) {

            if (course != null && !course.isBlank()) {
                String trimmedCourse = course.trim();
                ps.setString(1, trimmedCourse);
                ps.setString(2, trimmedCourse);
                ps.setString(3, trimmedCourse);
                ps.setString(4, courseCodeForName(trimmedCourse));
            }

            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> events = new ArrayList<>();

            while (rs.next()) {
                String courseName = courseNameFromId(rs.getString("course_id"), rs.getString("course_name"));

                Map<String, Object> event = new LinkedHashMap<>();
                event.put("id", rs.getLong("assessment_id"));
                event.put("title", courseName + ": " + rs.getString("title") +
                        " (" + formatWeight(rs.getDouble("weight_percent")) + "%)");
                event.put("start", rs.getString("exam_date"));
                event.put("color", colorFor(courseName));

                Map<String, Object> props = new LinkedHashMap<>();
                props.put("courseId", rs.getString("course_id"));
                props.put("courseName", courseName);
                props.put("type", rs.getString("assessment_type"));
                props.put("weightPercent", rs.getDouble("weight_percent"));
                props.put("topic", rs.getString("topic"));
                props.put("published", rs.getBoolean("is_published"));
                event.put("extendedProps", props);

                events.add(event);
            }

            sendJson(response, HttpServletResponse.SC_OK, events);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("error", "Could not load calendar events.");
            sendJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, payload);
        }
    }

    private String calendarQuery(String course) {
        String query = "SELECT a.assessment_id, a.course_id, a.title, a.assessment_type, " +
                "a.weight_percent, a.exam_date, a.topic, a.is_published, c.name AS course_name " +
                "FROM Assessments a " +
                "LEFT JOIN courses c ON CAST(c.id AS CHAR) = a.course_id " +
                "OR c.course_code = a.course_id " +
                "OR c.name = a.course_id " +
                "WHERE a.is_published = true ";

        if (course != null && !course.isBlank()) {
            query += "AND (a.course_id = ? OR CAST(c.id AS CHAR) = ? OR c.name = ? OR c.course_code = ?) ";
        }

        return query + "ORDER BY a.exam_date, a.assessment_id";
    }

    private String formatWeight(double weight) {
        if (weight == Math.rint(weight)) {
            return String.valueOf((int) weight);
        }
        return String.valueOf(weight);
    }

    private String colorFor(String courseName) {
        if ("Calculus II".equalsIgnoreCase(courseName)) {
            return "#ed8936";
        }
        return "#1a365d";
    }

    private String courseNameFromId(String courseId, String databaseName) {
        if (databaseName != null && !databaseName.isBlank()) {
            return databaseName;
        }
        if ("CMP120".equalsIgnoreCase(courseId)) {
            return "Intro to Programming";
        }
        if ("MTH104".equalsIgnoreCase(courseId)) {
            return "Calculus II";
        }
        return courseId;
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

    private void sendJson(HttpServletResponse response, int status, Object payload) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(gson.toJson(payload));
    }
}
