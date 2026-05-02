package courselink;

public class Course {
    private int id;
    private String name;
    private String instructor;
    private String courseCode;
    private int credits;

    public Course() {}

    public Course(int id, String name, String instructor) {
        this.id = id;
        this.name = name;
        this.instructor = instructor;
        this.credits = 3;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }
}
