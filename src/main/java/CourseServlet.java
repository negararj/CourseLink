import com.google.gson.Gson; // We will use Gson to convert Java objects to JSON
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// The @WebServlet annotation defines the URL endpoint your frontend will talk to
@WebServlet("/api/courses")
public class CourseServlet extends HttpServlet {

    private InstructorDAO instructorDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        // Initialize our DAO and Gson translator when the servlet starts
        instructorDAO = new InstructorDAO();
        gson = new Gson();
    }

    // GET requests are for FETCHING data (e.g., loading the dashboard)
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. Tell the frontend we are sending back JSON data
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // 2. Fetch the data using the DAO you just built
        // (Assuming you have a method like getCoursesForInstructor in your DAO)
        int instructorId = 1; // Hardcoded for now until we set up Login/Sessions
        List<Course> courses = instructorDAO.getCoursesForInstructor(instructorId);

        // 3. Convert the Java List into a JSON string and send it out
        String jsonOutput = gson.toJson(courses);
        PrintWriter out = response.getWriter();
        out.print(jsonOutput);
        out.flush();
    }

    // POST requests are for CREATING data (e.g., adding a new course)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // We will build this out next!
    }
}