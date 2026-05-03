package courselink.servlet;

import courselink.DBConnection;
import courselink.dao.*;
import courselink.model.*;
import courselink.util.PasswordUtil;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ProfileServlet extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Long userId = currentUserId(request, response);
        if (userId == null) {
            return;
        }

        User user = userDAO.findById(userId);
        if (user == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Could not find your profile.");
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", true);
        payload.put("user", userPayload(user));

        if ("student".equals(user.getRole())) {
            List<Course> courses = studentDAO.getEnrolledCourses(userId);
            payload.put("courses", courses);
            payload.put("totalCourses", courses.size());
            payload.put("totalCredits", courses.stream().mapToInt(Course::getCredits).sum());
        } else {
            payload.put("courses", List.of());
            payload.put("totalCourses", 0);
            payload.put("totalCredits", 0);
        }

        sendJson(response, HttpServletResponse.SC_OK, payload);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        Long userId = currentUserId(request, response);
        if (userId == null) {
            return;
        }

        request.setCharacterEncoding("UTF-8");

        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");
        String confirmPassword = request.getParameter("confirmPassword");

        if (isBlank(currentPassword) || isBlank(newPassword) || isBlank(confirmPassword)) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Please fill in all password fields.");
            return;
        }

        if (newPassword.length() < 6) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "New password must be at least 6 characters.");
            return;
        }

        if (!newPassword.equals(confirmPassword)) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "New password and confirmation do not match.");
            return;
        }

        User user = userDAO.findById(userId);
        if (user == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Could not find your profile.");
            return;
        }

        if (!PasswordUtil.verifyPassword(currentPassword, user.getPasswordHash())) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Current password is incorrect.");
            return;
        }

        boolean updated = userDAO.updatePassword(userId, PasswordUtil.hashPassword(newPassword));
        if (!updated) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not update your password.");
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", true);
        payload.put("message", "Password updated successfully.");
        sendJson(response, HttpServletResponse.SC_OK, payload);
    }

    private Long currentUserId(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in to view your profile.");
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
                sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in again.");
                return null;
            }
        }

        sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in again.");
        return null;
    }

    private Map<String, Object> userPayload(User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.getId());
        payload.put("firstName", user.getFirstName());
        payload.put("lastName", user.getLastName());
        payload.put("fullName", user.getFullName());
        payload.put("email", user.getEmail());
        payload.put("major", user.getMajor());
        payload.put("role", user.getRole());
        return payload;
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

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
