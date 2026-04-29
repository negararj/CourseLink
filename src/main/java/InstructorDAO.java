import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Date;
import java.sql.Timestamp;

public class InstructorDAO {

    // 1. Method to save an Assessment (Exam/Quiz) to the database
    public boolean addAssessment(Assessment exam) {
        // The ? marks are placeholders to prevent SQL Injection hackers!
        String sql = "INSERT INTO Assessments (course_id, title, assessment_type, weight_percent, exam_date, topic, instructions, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            // Replace the ? placeholders with the actual data from the Java object
            stmt.setString(1, exam.getCourseId());
            stmt.setString(2, exam.getTitle());
            stmt.setString(3, exam.getType());
            stmt.setDouble(4, exam.getWeightPercent());
            stmt.setDate(5, Date.valueOf(exam.getExamDate())); // Converts Java LocalDate to SQL Date
            stmt.setString(6, exam.getTopic());
            stmt.setString(7, exam.getInstructions());
            stmt.setBoolean(8, exam.isPublished());
            
            // Execute the save command
            int rowsInserted = stmt.executeUpdate();
            return rowsInserted > 0; // Returns true if it successfully saved
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. Method to save an uploaded Material to the database
    public boolean addMaterial(Material material) {
        String sql = "INSERT INTO Materials (course_id, title, category, file_path, upload_date) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, material.getCourseId());
            stmt.setString(2, material.getTitle());
            stmt.setString(3, material.getCategory());
            stmt.setString(4, material.getFilePath());
            stmt.setTimestamp(5, Timestamp.valueOf(material.getUploadDate())); // Converts Java LocalDateTime to SQL Timestamp
            
            int rowsInserted = stmt.executeUpdate();
            return rowsInserted > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}