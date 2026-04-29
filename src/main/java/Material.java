import java.time.LocalDateTime;

public class Material {
    private Long id;
    private String courseId;     // e.g., "CMP120"
    private String title;        // e.g., "Chapter 1 Summary"
    private String category;     // e.g., "Lecture Notes"
    private String filePath;     // Where the file is saved on the server
    private LocalDateTime uploadDate;

    // Default Constructor
    public Material() {}

    // Constructor for creating a new material
    public Material(String courseId, String title, String category, String filePath, LocalDateTime uploadDate) {
        this.courseId = courseId;
        this.title = title;
        this.category = category;
        this.filePath = filePath;
        this.uploadDate = uploadDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}