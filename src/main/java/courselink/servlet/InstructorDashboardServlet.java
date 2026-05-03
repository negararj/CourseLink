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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/instructor-dashboard")
public class InstructorDashboardServlet extends HttpServlet {
    private final InstructorDAO dao = new InstructorDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        List<Course> courses = dao.getAllCourses();
        List<Material> recentMaterials = dao.getRecentMaterials();
        List<Assessment> upcomingAssessments = dao.getUpcomingAssessments();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("totalStudents", dao.getStudentCount());
        payload.put("avgPerformance", "-");
        payload.put("activeCourses", courses.size());
        payload.put("totalUploads", dao.getMaterialCount());
        payload.put("courses", courses);
        payload.put("recentUploads", recentMaterials.stream().map(this::materialJson).toList());
        payload.put("upcomingExams", upcomingAssessments.stream().map(this::assessmentJson).toList());

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(gson.toJson(payload));
    }

    private Map<String, Object> materialJson(Material material) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", material.getId());
        item.put("courseId", material.getCourseId());
        item.put("title", material.getTitle());
        item.put("category", material.getCategory());
        item.put("filePath", material.getFilePath());
        item.put("uploadDate", material.getUploadDate() == null ? null : material.getUploadDate().toString());
        return item;
    }

    private Map<String, Object> assessmentJson(Assessment assessment) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", assessment.getId());
        item.put("courseId", assessment.getCourseId());
        item.put("title", assessment.getTitle());
        item.put("type", assessment.getType());
        item.put("weightPercent", assessment.getWeightPercent());
        item.put("date", assessment.getExamDate() == null ? null : assessment.getExamDate().toString());
        item.put("topic", assessment.getTopic());
        return item;
    }
}
