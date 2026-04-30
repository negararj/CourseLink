
public class Course {
    private Long id;
    private String title;
    private String code;
    private int credits;

    // Default Constructor (Required for fetching from the database)
    public Course() {
    }

    // Constructor with parameters (Useful for creating new courses quickly)
    public Course(String title, String code, int credits) {
        this.title = title;
        this.code = code;
        this.credits = credits;
    }

    // --- Getters and Setters ---

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getTitle() { 
        return title; 
    }
    
    public void setTitle(String title) { 
        this.title = title; 
    }

    public String getCode() { 
        return code; 
    }
    
    public void setCode(String code) { 
        this.code = code; 
    }

    public int getCredits() { 
        return credits; 
    }
    
    public void setCredits(int credits) { 
        this.credits = credits; 
    }
}