package courselink;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class InstructorDAO {

    public List<Course> getAllCourses() {
        List<Course> courses = new ArrayList<>();

        try {
            Connection conn = DBConnection.getConnection();

            String query = "SELECT * FROM courses";
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Course c = new Course();
                c.setId(rs.getInt("id"));
                c.setName(rs.getString("name"));
                c.setInstructor(rs.getString("instructor"));
                courses.add(c);
            }

            conn.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return courses;
    }

    public void addCourse(String name, String instructor) {
        try {
            Connection conn = DBConnection.getConnection();

            String query = "INSERT INTO courses (name, instructor) VALUES (?, ?)";
            PreparedStatement ps = conn.prepareStatement(query);
            ps.setString(1, name);
            ps.setString(2, instructor);

            ps.executeUpdate();
            conn.close();

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
        String query = "SELECT * FROM Assessments WHERE course_id = ? AND is_published = true ORDER BY exam_date";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, courseId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
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
                assessments.add(assessment);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return assessments;
    }
}
