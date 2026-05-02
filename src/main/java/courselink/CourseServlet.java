package courselink;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;

@WebServlet("/CourseServlet")
public class CourseServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        InstructorDAO dao = new InstructorDAO();
        List<Course> courses = dao.getAllCourses();

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        Gson gson = new Gson();
        out.print(gson.toJson(courses));
        out.flush();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = trim(request.getParameter("name"));
        String instructor = trim(request.getParameter("instructor"));

        if (name == null || instructor == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Course name and instructor are required.");
            return;
        }

        InstructorDAO dao = new InstructorDAO();
        dao.addCourse(name, instructor);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().print("{\"success\":true}");
    }

    private String trim(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
}
