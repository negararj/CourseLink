package courselink;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String email = trim(request.getParameter("email")).toLowerCase();
        String password = request.getParameter("password");
        String requestedRole = trim(request.getParameter("role")).toLowerCase();

        if (isBlank(email) || isBlank(password) || isBlank(requestedRole)) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, false, "Please enter your email, password, and role.", null);
            return;
        }

        User user = userDAO.findByEmail(email);
        if (user == null || !PasswordUtil.verifyPassword(password, user.getPasswordHash())) {
            sendJson(response, HttpServletResponse.SC_UNAUTHORIZED, false, "Invalid email or password.", null);
            return;
        }

        if (!user.getRole().equals(requestedRole)) {
            sendJson(response, HttpServletResponse.SC_FORBIDDEN, false, "Please choose the correct role for this account.", null);
            return;
        }

        createSession(request, user);
        sendJson(response, HttpServletResponse.SC_OK, true, "Login successful.", dashboardFor(user.getRole()));
    }

    private void createSession(HttpServletRequest request, User user) {
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("role", user.getRole());
        session.setAttribute("fullName", user.getFullName());
    }

    private void sendJson(HttpServletResponse response, int status, boolean success, String message, String redirect)
            throws IOException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", success);
        payload.put("message", message);
        if (redirect != null) {
            payload.put("redirect", redirect);
        }

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(gson.toJson(payload));
    }

    private String dashboardFor(String role) {
        return "instructor".equals(role) ? "InstructorDashboard.html" : "StudentDashboard.html";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
