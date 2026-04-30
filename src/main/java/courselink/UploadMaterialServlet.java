package courselink;

import com.google.gson.Gson;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URLConnection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@WebServlet(urlPatterns = {"/api/upload-material", "/uploads/*"})
@MultipartConfig(maxFileSize=10_000_000)
public class UploadMaterialServlet extends HttpServlet {

    private InstructorDAO dao = new InstructorDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        if ("/uploads".equals(req.getServletPath())) {
            streamUploadedFile(req, res);
            return;
        }

        String courseId = req.getParameter("courseId");
        List<Material> materials = dao.getMaterialsByCourse(courseId);

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().print(gson.toJson(materials.stream()
                .map(this::toJson)
                .toList()));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException, jakarta.servlet.ServletException {

        String courseId = req.getParameter("courseId");
        String title    = req.getParameter("title");
        String category = req.getParameter("category");

        Part filePart = req.getPart("file");
        String fileName = Path.of(filePart.getSubmittedFileName()).getFileName().toString();
        Path uploadDir = uploadDirectory();
        Files.createDirectories(uploadDir);

        String storedFileName = System.currentTimeMillis() + "-" + fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path savedFile = uploadDir.resolve(storedFileName);
        filePart.write(savedFile.toString());

        Material material = new Material(courseId, title, category, "uploads/" + storedFileName, LocalDateTime.now());
        boolean ok = dao.addMaterial(material);

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().print("{\"success\":" + ok + "}");
    }

    private void streamUploadedFile(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        String requestedName = req.getPathInfo();
        if (requestedName == null || requestedName.isBlank()) {
            res.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String safeName = Path.of(requestedName).getFileName().toString();
        Path file = uploadDirectory().resolve(safeName);

        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            res.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String contentType = URLConnection.guessContentTypeFromName(safeName);
        res.setContentType(contentType == null ? "application/octet-stream" : contentType);
        res.setHeader("Content-Disposition", "inline; filename=\"" + safeName + "\"");
        res.setContentLengthLong(Files.size(file));
        Files.copy(file, res.getOutputStream());
    }

    private Path uploadDirectory() {
        return Path.of(System.getProperty("user.home"), "CourseLink", "uploads");
    }

    private Map<String, Object> toJson(Material material) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", material.getId());
        item.put("courseId", material.getCourseId());
        item.put("title", material.getTitle());
        item.put("category", material.getCategory());
        item.put("filePath", material.getFilePath());
        item.put("uploadDate", material.getUploadDate() == null ? null : material.getUploadDate().toString());
        return item;
    }
}
