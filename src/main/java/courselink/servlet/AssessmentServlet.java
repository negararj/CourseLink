package courselink.servlet;

import courselink.DBConnection;
import courselink.dao.*;
import courselink.model.*;
import courselink.util.PasswordUtil;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/AssessmentServlet")
public class AssessmentServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String courseId = request.getParameter("course");
        InstructorDAO dao = new InstructorDAO();
        List<Assessment> assessments = dao.getAssessmentsByCourse(courseId);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(new Gson().toJson(toJsonList(assessments)));
    }

    private List<Map<String, Object>> toJsonList(List<Assessment> assessments) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (Assessment assessment : assessments) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", assessment.getId());
            item.put("courseId", assessment.getCourseId());
            item.put("title", assessment.getTitle());
            item.put("type", assessment.getType());
            item.put("weightPercent", assessment.getWeightPercent());
            item.put("date", assessment.getExamDate() == null ? null : assessment.getExamDate().toString());
            item.put("topic", assessment.getTopic());
            item.put("instructions", assessment.getInstructions());
            item.put("published", assessment.isPublished());
            result.add(item);
        }

        return result;
    }
}
