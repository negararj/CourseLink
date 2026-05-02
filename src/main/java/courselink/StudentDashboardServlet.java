package courselink;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/student-dashboard")
public class StudentDashboardServlet extends HttpServlet {
    private final StudentDAO dao = new StudentDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Long userId = studentUserId(request, response);
        if (userId == null) {
            return;
        }

        List<Course> courses = dao.getEnrolledCourses(userId);
        List<Map<String, Object>> alerts = dao.getUpcomingAlerts(userId);
        Map<String, Object> gradeSummary = dao.getGradeSummary(userId);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("averageGrade", gradeSummary.get("averageGrade"));
        payload.put("semGPA", gradeSummary.get("cgpa"));
        payload.put("totalCGPA", gradeSummary.get("cgpa"));
        payload.put("gradedCredits", gradeSummary.get("gradedCredits"));
        payload.put("enrolledCourses", courses);
        payload.put("alerts", alerts);
        payload.put("totalCourses", courses.size());
        payload.put("totalCredits", courses.stream().mapToInt(Course::getCredits).sum());

        sendJson(response, HttpServletResponse.SC_OK, payload);
    }

    private Long studentUserId(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in as a student.");
            return null;
        }

        String role = (String) session.getAttribute("role");
        if (!"student".equals(role)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "This page is only available for students.");
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
                sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in as a student.");
                return null;
            }
        }

        sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in as a student.");
        return null;
    }

    private void sendError(HttpServletResponse response, int status, String message)
            throws IOException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", false);
        payload.put("message", message);
        sendJson(response, status, payload);
    }

    private void sendJson(HttpServletResponse response, int status, Object payload)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(gson.toJson(payload));
    }
}
