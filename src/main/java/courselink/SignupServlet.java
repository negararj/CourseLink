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

@WebServlet("/api/signup")
public class SignupServlet extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String firstName = trim(request.getParameter("firstName"));
        String lastName = trim(request.getParameter("lastName"));
        String email = trim(request.getParameter("email")).toLowerCase();
        String major = trim(request.getParameter("major"));
        String role = trim(request.getParameter("role")).toLowerCase();
        String password = request.getParameter("password");

        if (isBlank(firstName) || isBlank(lastName) || isBlank(email) || isBlank(role) || isBlank(password)) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, false, "Please complete all required fields.", null);
            return;
        }

        if (!"student".equals(role) && !"instructor".equals(role)) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, false, "Please choose a valid role.", null);
            return;
        }

        if (password.length() < 8) {
            sendJson(response, HttpServletResponse.SC_BAD_REQUEST, false, "Password must be at least 8 characters.", null);
            return;
        }

        if (userDAO.findByEmail(email) != null) {
            sendJson(response, HttpServletResponse.SC_CONFLICT, false, "An account with this email already exists.", null);
            return;
        }

        User user = new User(firstName, lastName, email, major, role, PasswordUtil.hashPassword(password));
        if (!userDAO.createUser(user)) {
            sendJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, false, "Could not create your account.", null);
            return;
        }

        createSession(request, user);
        sendJson(response, HttpServletResponse.SC_OK, true, "Account created successfully.", dashboardFor(role));
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
