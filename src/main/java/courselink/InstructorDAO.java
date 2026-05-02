package courselink;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class InstructorDAO {

    public List<Course> getAllCourses() {
        List<Course> courses = new ArrayList<>();

        String query = "SELECT id, name, instructor, course_code, credits FROM courses ORDER BY name";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Course c = new Course();
                c.setId(rs.getInt("id"));
                c.setName(rs.getString("name"));
                c.setInstructor(rs.getString("instructor"));
                c.setCourseCode(rs.getString("course_code"));
                c.setCredits(rs.getInt("credits"));
                courses.add(c);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return courses;
    }

    public void addCourse(String name, String instructor) {
        String query = "INSERT INTO courses (name, instructor) VALUES (?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, name);
            ps.setString(2, instructor);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean addAssessment(Assessment exam) {
        String query = "INSERT INTO Assessments (course_id, title, assessment_type, weight_percent, exam_date, topic, instructions, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, exam.getCourseId());
            ps.setString(2, exam.getTitle());
            ps.setString(3, exam.getType());
            ps.setDouble(4, exam.getWeightPercent());
            ps.setDate(5, Date.valueOf(exam.getExamDate()));
            ps.setString(6, exam.getTopic());
            ps.setString(7, exam.getInstructions());
            ps.setBoolean(8, exam.isPublished());

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Assessment> getAssessmentsByCourse(String courseId) {
        List<Assessment> assessments = new ArrayList<>();
        String query = "SELECT * FROM Assessments WHERE is_published = true AND (? IS NULL OR course_id = ?) ORDER BY exam_date";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, courseId);
            ps.setString(2, courseId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                assessments.add(readAssessment(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return assessments;
    }

    public List<Assessment> getUpcomingAssessments() {
        List<Assessment> assessments = new ArrayList<>();
        String query = "SELECT * FROM Assessments WHERE is_published = true AND exam_date >= CURDATE() ORDER BY exam_date LIMIT 5";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                assessments.add(readAssessment(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return assessments;
    }

    public boolean addMaterial(Material material) {
        String query = "INSERT INTO Materials (course_id, title, category, file_path, upload_date) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, material.getCourseId());
            ps.setString(2, material.getTitle());
            ps.setString(3, material.getCategory());
            ps.setString(4, material.getFilePath());
            ps.setTimestamp(5, Timestamp.valueOf(material.getUploadDate()));

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Material> getMaterialsByCourse(String courseId) {
        List<Material> materials = new ArrayList<>();
        String query = "SELECT * FROM Materials WHERE course_id = ? ORDER BY upload_date DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, courseId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Material material = new Material();
                material.setId(rs.getLong("material_id"));
                material.setCourseId(rs.getString("course_id"));
                material.setTitle(rs.getString("title"));
                material.setCategory(rs.getString("category"));
                material.setFilePath(rs.getString("file_path"));

                Timestamp uploadDate = rs.getTimestamp("upload_date");
                if (uploadDate != null) {
                    material.setUploadDate(uploadDate.toLocalDateTime());
                }

                materials.add(material);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return materials;
    }

    public List<Material> getRecentMaterials() {
        List<Material> materials = new ArrayList<>();
        String query = "SELECT * FROM Materials ORDER BY upload_date DESC LIMIT 5";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Material material = new Material();
                material.setId(rs.getLong("material_id"));
                material.setCourseId(rs.getString("course_id"));
                material.setTitle(rs.getString("title"));
                material.setCategory(rs.getString("category"));
                material.setFilePath(rs.getString("file_path"));

                Timestamp uploadDate = rs.getTimestamp("upload_date");
                if (uploadDate != null) {
                    material.setUploadDate(uploadDate.toLocalDateTime());
                }

                materials.add(material);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return materials;
    }

    public int getMaterialCount() {
        String query = "SELECT COUNT(*) AS total FROM Materials";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt("total");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return 0;
    }

    public int getStudentCount() {
        String query = "SELECT COUNT(*) AS total FROM Users WHERE role = 'student'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt("total");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return 0;
    }

    private Assessment readAssessment(ResultSet rs) throws SQLException {
        Assessment assessment = new Assessment();
        assessment.setId(rs.getLong("assessment_id"));
        assessment.setCourseId(rs.getString("course_id"));
        assessment.setTitle(rs.getString("title"));
        assessment.setType(rs.getString("assessment_type"));
        assessment.setWeightPercent(rs.getDouble("weight_percent"));

        Date examDate = rs.getDate("exam_date");
        if (examDate != null) {
            assessment.setExamDate(examDate.toLocalDate());
        }

        assessment.setTopic(rs.getString("topic"));
        assessment.setInstructions(rs.getString("instructions"));
        assessment.setPublished(rs.getBoolean("is_published"));
        return assessment;
    }
}
