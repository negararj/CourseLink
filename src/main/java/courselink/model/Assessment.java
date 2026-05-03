package courselink.model;
import java.time.LocalDate;

public class Assessment {
    private Long id;
    private String courseId;
    private String title;          // e.g., "Midterm Exam"
    private String type;           // e.g., "Exam", "Quiz"
    private double weightPercent;  // e.g., 25.0 (for 25%)
    private LocalDate examDate;    
    private String topic;          // e.g., "Data Structures"
    private String instructions;
    private boolean isPublished;   // true if visible to students

    // Default Constructor
    public Assessment() {}

    // Constructor for scheduling a new assessment
    public Assessment(String courseId, String title, String type, double weightPercent, LocalDate examDate, String topic, String instructions, boolean isPublished) {
        this.courseId = courseId;
        this.title = title;
        this.type = type;
        this.weightPercent = weightPercent;
        this.examDate = examDate;
        this.topic = topic;
        this.instructions = instructions;
        this.isPublished = isPublished;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getWeightPercent() { return weightPercent; }
    public void setWeightPercent(double weightPercent) { this.weightPercent = weightPercent; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public boolean isPublished() { return isPublished; }
    public void setPublished(boolean isPublished) { this.isPublished = isPublished; }
}
