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

        String courseId = req.getParameter("courseId");
        String title = req.getParameter("title");
        String type = req.getParameter("type");
        String weightValue = req.getParameter("weight");
        String dateValue = req.getParameter("date");
        String topic = req.getParameter("topic");
        boolean published = Boolean.parseBoolean(req.getParameter("published"));

        boolean ok = false;

        if (courseId != null && title != null && type != null && weightValue != null && dateValue != null) {
            double weight = Double.parseDouble(weightValue);
            LocalDate examDate = LocalDate.parse(dateValue);
            Assessment exam = new Assessment(courseId, title, type, weight, examDate, topic, "", published);
            ok = dao.addAssessment(exam);
        }

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().print(gson.toJson(new Result(ok)));
    }

    private static class Result {
        private final boolean success;

        private Result(boolean success) {
            this.success = success;
        }
    }
}
