package courselink;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/course-classmates")
public class CourseClassmatesServlet extends HttpServlet {
    private final StudentDAO dao = new StudentDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Long userId = studentUserId(request, response);
        if (userId == null) {
            return;
        }

        Integer courseId = courseId(request, response);
        if (courseId == null) {
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("classmates", dao.getClassmates(userId, courseId));
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

    private Integer courseId(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String value = request.getParameter("courseId");
        if (value == null || value.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Course ID is required.");
            return null;
        }

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Course ID must be a number.");
            return null;
        }
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
