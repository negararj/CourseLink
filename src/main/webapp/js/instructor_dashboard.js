// Data for Instructor Dashboard
const instructorData = {
    totalStudents: 142,
    avgPerformance: "84%",
    activeCourses: 2,
    totalUploads: 20,
    courses: [
        { title: "Intro to Programming", code: "CMP120", students: 85, uploads: 12, icon: "💻", color: "one" },
        { title: "Calculus II", code: "MTH104", students: 57, uploads: 8, icon: "📐", color: "two" }
    ],
    recentUploads: [
        { title: "Chapter 4: Data Structures", course: "CMP120", date: "2 hours ago", type: "PDF" },
        { title: "Midterm Review Sheet", course: "MTH104", date: "Yesterday", type: "DOCX" },
        { title: "Quiz 3 Sample Solutions", course: "CMP120", date: "2 days ago", type: "PDF" }
    ],
    upcomingExams: [
        { title: "Midterm Exam 1", course: "CMP120", date: "Oct 28", time: "10:00 AM" },
        { title: "Quiz 3", course: "MTH104", date: "Oct 30", time: "2:30 PM" },
        { title: "Final Project Draft", course: "CMP120", date: "Nov 05", time: "11:59 PM" }
    ]
};

// 1. Populate Courses Taught
const coursesList = document.getElementById('courses-taught-list');
instructorData.courses.forEach(course => {
    coursesList.innerHTML += `
        <div class="course-entry shadow-sm mb-3">
            <div class="feature-icon ${course.color} me-4" style="width:55px; height:55px; font-size:1.4rem;">
                ${course.icon}
            </div>
            <div class="flex-grow-1">
                <h5 class="fw-bold mb-0">${course.title}</h5>
                <p class="text-muted small mb-0">${course.code} • ${course.students} Students</p>
            </div>
            <div class="text-end me-4 d-none d-md-block">
                <h6 class="fw-bold mb-0">${course.uploads}</h6>
                <small class="text-muted">Uploads</small>
            </div>
            <div class="d-flex gap-2">
                <a href="InstructorSyllabus.html?course=${encodeURIComponent(course.title)}" class="btn btn-outline-primary btn-sm rounded-pill px-3">Syllabus</a>
                <a href="InstructorMaterials.html?course=${encodeURIComponent(course.title)}" class="btn btn-primary btn-sm rounded-pill px-3">Manage</a>
            </div>
        </div>
    `;
});

// 2. Populate Recent Uploads
const uploadsList = document.getElementById('recent-uploads-list');
instructorData.recentUploads.forEach(upload => {
    uploadsList.innerHTML += `
        <div class="course-entry shadow-sm mb-2" style="padding: 1rem 1.5rem;">
            <div class="flex-grow-1">
                <h6 class="fw-bold mb-0">${upload.title}</h6>
                <p class="text-muted small mb-0">${upload.course} • ${upload.date}</p>
            </div>
            <span class="badge bg-light text-dark border">${upload.type}</span>
        </div>
    `;
});

// 3. Populate Upcoming Exams
const examsList = document.getElementById('upcoming-exams-list');
instructorData.upcomingExams.forEach(exam => {
    examsList.innerHTML += `
        <div class="alert-box mb-3" style="border-left: 4px solid var(--cl-primary);">
            <small class="text-primary fw-bold text-uppercase" style="font-size: 0.7rem;">${exam.date} • ${exam.time}</small>
            <h6 class="fw-bold mb-1 mt-1">${exam.title}</h6>
            <p class="small text-muted mb-0">${exam.course}</p>
        </div>
    `;
});

// 4. Handle Modal Submissions (Mock)
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Material uploaded successfully!');
    bootstrap.Modal.getInstance(document.getElementById('uploadMaterialModal')).hide();
});

document.getElementById('examForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('examName').value;
    const date = document.getElementById('examDate').value;
    const course = document.getElementById('examCourse').value;
    const weight = document.getElementById('examWeight').value;
    const topic = document.getElementById('examTopic').value;
    const isPublished = document.getElementById('publishToStudents').checked;

    // Save to localStorage for calendars
    const newEvent = {
        title: `${course}: ${name} (${weight}%)`,
        start: date,
        color: course.includes('Calculus') ? '#ed8936' : '#1a365d',
        extendedProps: {
            topic: topic,
            published: isPublished
        }
    };

    let events = JSON.parse(localStorage.getItem('courseLinkEvents')) || [];
    events.push(newEvent);
    localStorage.setItem('courseLinkEvents', JSON.stringify(events));

    alert(`${name} scheduled successfully!\nCourse: ${course}\nDate: ${date}\nTopic: ${topic}\nWeight: ${weight}%\nPublished to Student Calendars: ${isPublished ? 'Yes' : 'No'}`);
    bootstrap.Modal.getInstance(document.getElementById('createExamModal')).hide();
    this.reset();
});