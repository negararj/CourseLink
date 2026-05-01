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

@WebServlet("/api/current-user")
public class CurrentUserServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            sendJson(response, HttpServletResponse.SC_UNAUTHORIZED, false, null, null, null);
            return;
        }

        sendJson(
                response,
                HttpServletResponse.SC_OK,
                true,
                (String) session.getAttribute("fullName"),
                (String) session.getAttribute("email"),
                (String) session.getAttribute("role")
        );
    }

    private void sendJson(HttpServletResponse response, int status, boolean authenticated,
                          String fullName, String email, String role) throws IOException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("authenticated", authenticated);
        if (authenticated) {
            payload.put("fullName", fullName);
            payload.put("email", email);
            payload.put("role", role);
            payload.put("initials", initialsFrom(fullName, email));
        }

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(gson.toJson(payload));
    }

    private String initialsFrom(String fullName, String email) {
        String source = fullName == null || fullName.isBlank() ? email : fullName;
        if (source == null || source.isBlank()) {
            return "U";
        }

        String[] parts = source.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            if (!part.isBlank()) {
                initials.append(Character.toUpperCase(part.charAt(0)));
            }
            if (initials.length() == 2) {
                break;
            }
        }

        return initials.length() == 0 ? "U" : initials.toString();
    }
}
