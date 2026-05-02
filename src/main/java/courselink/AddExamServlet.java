package courselink;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.time.LocalDate;

@WebServlet("/api/add-exam")
public class AddExamServlet extends HttpServlet {

    private InstructorDAO dao = new InstructorDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException, jakarta.servlet.ServletException {

        String courseId = trim(req.getParameter("courseId"));
        String title = trim(req.getParameter("title"));
        String type = trim(req.getParameter("type"));
        String weightValue = trim(req.getParameter("weight"));
        String dateValue = trim(req.getParameter("date"));
        String topic = trim(req.getParameter("topic"));
        boolean published = Boolean.parseBoolean(req.getParameter("published"));

        boolean ok = false;

        if (courseId != null && title != null && type != null && weightValue != null && dateValue != null) {
            try {
            double weight = Double.parseDouble(weightValue);
            LocalDate examDate = LocalDate.parse(dateValue);
            Assessment exam = new Assessment(courseId, title, type, weight, examDate, topic, "", published);
            ok = dao.addAssessment(exam);
            } catch (RuntimeException e) {
                ok = false;
            }
        }

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().print(gson.toJson(new Result(ok)));
    }

    private String trim(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }

    private static class Result {
        private final boolean success;

        private Result(boolean success) {
            this.success = success;
        }
    }
}
