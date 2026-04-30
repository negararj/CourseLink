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

        String name = request.getParameter("name");
        String instructor = request.getParameter("instructor");

        InstructorDAO dao = new InstructorDAO();
        dao.addCourse(name, instructor);

        response.setStatus(HttpServletResponse.SC_OK);
    }
}
