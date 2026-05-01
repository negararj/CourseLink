// GPA stats are still static for now. We are only connecting the course list in this step.
const dashboardData = {
    semGPA: "3.82",
    totalCGPA: "3.75",
    alerts: [
        { type: "Today", title: "New Material", desc: "Prof. Ahmed uploaded Quiz 2 Prep." },
        { type: "Oct 28", title: "Exam Reminder", desc: "Calculus Midterm is in 3 days." }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("current-gpa").innerText = dashboardData.semGPA;
    document.getElementById("current-cgpa").innerText = dashboardData.totalCGPA;

    loadDashboardCourses();
    loadAlerts();
});

function loadDashboardCourses() {
    const courseList = document.getElementById("course-list-container");
    courseList.innerHTML = `<p class="text-muted">Loading courses...</p>`;

    fetch("CourseServlet")
        .then(response => response.json())
        .then(courses => {
            courseList.innerHTML = "";

            if (courses.length === 0) {
                courseList.innerHTML = `<p class="text-muted">No enrolled courses yet.</p>`;
                return;
            }

            courses.forEach((course, index) => {
                courseList.innerHTML += `
                    <div class="course-entry shadow-sm">
                        <div class="feature-icon ${index % 2 === 0 ? "one" : "two"} me-4" style="width:55px; height:55px; font-size:1rem;">
                            CL
                        </div>
                        <div>
                            <h5 class="fw-bold mb-0">${course.name}</h5>
                            <p class="text-muted small mb-0">${course.instructor}</p>
                        </div>
                        <a href="Materials.html?course=${encodeURIComponent(course.name)}" class="btn btn-outline-primary btn-sm ms-auto rounded-pill px-4">View</a>
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error("Error:", error);
            courseList.innerHTML = `<p class="text-danger">Could not load courses.</p>`;
        });
}

function loadAlerts() {
    const alertList = document.getElementById("alerts-container");
    alertList.innerHTML = "";

    dashboardData.alerts.forEach(alert => {
        alertList.innerHTML += `
            <div class="alert-box">
                <small class="text-accent fw-bold">${alert.type}</small>
                <h6 class="fw-bold mb-1 mt-1">${alert.title}</h6>
                <p class="small text-muted mb-0">${alert.desc}</p>
            </div>
        `;
    });
}
