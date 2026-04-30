<<<<<<< HEAD
// 1. Populate GPA Stats
document.getElementById('current-gpa').innerText = "3.82";
document.getElementById('current-cgpa').innerText = "3.75";

// 2. Load Courses from backend
const courseList = document.getElementById('course-list-container');
const colors = ["one", "two", "three", "four"];

fetch('/Student-porta/api/student/mycourses')
    .then(res => res.json())
    .then(courses => {
        courses.forEach((course, index) => {
            courseList.innerHTML += `
                <div class="course-entry shadow-sm">
                    <div class="feature-icon ${colors[index % colors.length]} me-4" style="width:55px; height:55px; font-size:1.4rem;">
                        💻
                    </div>
                    <div>
                        <h5 class="fw-bold mb-0">${course.name}</h5>
                        <p class="text-muted small mb-0">${course.code}</p>
                    </div>
                    <a href="MyCourses.html" class="btn btn-outline-primary btn-sm ms-auto rounded-pill px-4">View</a>
                </div>
            `;
        });
    });

// 3. Load Alerts
const alertList = document.getElementById('alerts-container');
const alerts = [
    { type: "Today", title: "New Material", desc: "Check your courses for new uploads." },
    { type: "Upcoming", title: "Stay on track", desc: "Check your grade tracker regularly." }
];
alerts.forEach(alert => {
    alertList.innerHTML += `
        <div class="alert-box">
            <small class="text-accent fw-bold">${alert.type}</small>
            <h6 class="fw-bold mb-1 mt-1">${alert.title}</h6>
            <p class="small text-muted mb-0">${alert.desc}</p>
        </div>
    `;
=======
// Data for your Dashboard
const dashboardData = {
    semGPA: "3.82",
    totalCGPA: "3.75",
    standing: "Semester 4",
    courses: [
        { title: "Intro to Programming", code: "CMP120", icon: "💻", color: "one" },
        { title: "Calculus II", code: "MTH104", icon: "📐", color: "two" }
    ],
    alerts: [
        { type: "Today", title: "New Material", desc: "Prof. Ahmed uploaded Quiz 2 Prep." },
        { type: "Oct 28", title: "Exam Reminder", desc: "Calculus Midterm is in 3 days." }
    ]
};

// 1. Populate GPA Stats
document.getElementById('current-gpa').innerText = dashboardData.semGPA;
document.getElementById('current-cgpa').innerText = dashboardData.totalCGPA;

// 2. Load Courses
const courseList = document.getElementById('course-list-container');
dashboardData.courses.forEach(course => {
    courseList.innerHTML += `
        <div class="course-entry shadow-sm">
            <div class="feature-icon ${course.color} me-4" style="width:55px; height:55px; font-size:1.4rem;">
                ${course.icon}
            </div>
            <div>
                <h5 class="fw-bold mb-0">${course.title}</h5>
                <p class="text-muted small mb-0">${course.code}</p>
            </div>
            <a href="Materials.html?course=${encodeURIComponent(course.name)}" class="btn btn-outline-primary btn-sm ms-auto rounded-pill px-4">View</a>
        </div>
    `;
});

// 3. Load Alerts
const alertList = document.getElementById('alerts-container');
dashboardData.alerts.forEach(alert => {
    alertList.innerHTML += `
        <div class="alert-box">
            <small class="text-accent fw-bold">${alert.type}</small>
            <h6 class="fw-bold mb-1 mt-1">${alert.title}</h6>
            <p class="small text-muted mb-0">${alert.desc}</p>
        </div>
    `;
>>>>>>> 1f0fbf236b788b6f6c654964563be6376a6cd2ff
});