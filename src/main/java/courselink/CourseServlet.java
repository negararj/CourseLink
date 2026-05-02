package courselink;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;

@WebServlet({"/CourseServlet", "/api/courses"})
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

        String name = request.getParameter("name");
        String code = request.getParameter("code");
        String instructor = request.getParameter("instructor");
        if (name == null || name.isBlank() || code == null || code.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Course name and code are required.");
            return;
        }
        if (instructor == null || instructor.isBlank()) {
            HttpSession session = request.getSession(false);
            instructor = session == null ? null : (String) session.getAttribute("fullName");
        }
        if (instructor == null || instructor.isBlank()) {
            instructor = "Instructor";
        }

        InstructorDAO dao = new InstructorDAO();
        dao.addCourse(code, name, instructor);

        response.setStatus(HttpServletResponse.SC_OK);
    }
}
