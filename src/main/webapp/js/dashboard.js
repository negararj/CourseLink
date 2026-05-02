document.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboard();
});

function loadStudentDashboard() {
    const courseList = document.getElementById("course-list-container");
    const alertList = document.getElementById("alerts-container");

    courseList.innerHTML = `<p class="text-muted">Loading courses...</p>`;
    alertList.innerHTML = `<p class="text-muted">Loading alerts...</p>`;

    fetch("api/student-dashboard", {
        credentials: "same-origin"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load student dashboard.");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("current-gpa").innerText = formatPercent(data.averageGrade, data.gradedCredits);
            document.getElementById("current-cgpa").innerText = formatGpa(data.totalCGPA, data.gradedCredits);

            renderDashboardCourses(data.enrolledCourses || []);
            renderAlerts(data.alerts || []);
        })
        .catch(error => {
            console.error("Student Dashboard Error:", error);
            courseList.innerHTML = `<p class="text-danger">Could not load your enrolled courses.</p>`;
            alertList.innerHTML = `<p class="text-danger">Could not load alerts.</p>`;
        });
}

function renderDashboardCourses(courses) {
    const courseList = document.getElementById("course-list-container");
    courseList.innerHTML = "";

    if (courses.length === 0) {
        courseList.innerHTML = `<p class="text-muted">No enrolled courses yet.</p>`;
        return;
    }

    courses.forEach((course, index) => {
        const initials = initialsFor(course);
        courseList.innerHTML += `
            <div class="course-entry shadow-sm">
                <div class="feature-icon ${index % 2 === 0 ? "one" : "two"} me-4" style="width:55px; height:55px; font-size:1rem;">
                    ${escapeHtml(initials)}
                </div>
                <div>
                    <h5 class="fw-bold mb-0">${escapeHtml(course.name)}</h5>
                    <p class="text-muted small mb-0">
                        ${escapeHtml(course.instructor)}
                        ${course.credits ? ` &bull; ${escapeHtml(course.credits)} credits` : ""}
                    </p>
                </div>
                <a href="Materials.html?course=${encodeURIComponent(course.courseCode || course.id || course.name)}" class="btn btn-outline-primary btn-sm ms-auto rounded-pill px-4">View</a>
            </div>
        `;
    });
}

function renderAlerts(alerts) {
    const alertList = document.getElementById("alerts-container");
    alertList.innerHTML = "";

    if (alerts.length === 0) {
        alertList.innerHTML = `<p class="text-muted">No upcoming alerts.</p>`;
        return;
    }

    alerts.forEach(alert => {
        alertList.innerHTML += `
            <div class="alert-box">
                <small class="text-accent fw-bold">${escapeHtml(formatAlertDate(alert.date))}</small>
                <h6 class="fw-bold mb-1 mt-1">${escapeHtml(alert.title)}</h6>
                <p class="small text-muted mb-0">${escapeHtml(alert.description || alert.courseName || "")}</p>
            </div>
        `;
    });
}

function initialsFor(course) {
    if (course.courseCode) {
        return course.courseCode.substring(0, 2).toUpperCase();
    }

    return (course.name || "CL")
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function formatAlertDate(value) {
    if (!value) {
        return "Upcoming";
    }

    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });
}

function formatPercent(value, gradedCredits) {
    const number = Number(value);
    if (!Number.isFinite(number) || Number(gradedCredits) === 0) {
        return "N/A";
    }

    return `${Number.isInteger(number) ? number : number.toFixed(2)}%`;
}

function formatGpa(value, gradedCredits) {
    const number = Number(value);
    if (!Number.isFinite(number) || Number(gradedCredits) === 0) {
        return "N/A";
    }

    return number.toFixed(2);
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
