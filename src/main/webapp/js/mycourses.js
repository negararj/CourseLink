document.addEventListener("DOMContentLoaded", () => {
    loadCourses();

    const form = document.getElementById("addCourseForm");
    if (form) {
        form.addEventListener("submit", addCourse);
    }
});

function loadCourses() {
    fetch("CourseServlet")
        .then(response => response.json())
        .then(data => displayCourses(data))
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("registered-courses-grid").innerHTML =
                `<p class="text-danger">Could not load courses.</p>`;
        });
}

function displayCourses(courses) {
    const container = document.getElementById("registered-courses-grid");
    container.innerHTML = "";

    if (courses.length === 0) {
        container.innerHTML = `<p class="text-muted">No courses registered yet.</p>`;
        return;
    }

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "col-md-6 col-xl-4";
        card.innerHTML = `
            <div class="feature-card p-4 h-100">
                <h5 class="fw-bold mb-1">${course.name}</h5>
                <p class="text-muted small mb-0">${course.instructor}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function addCourse(event) {
    event.preventDefault();

    const name = document.getElementById("courseName").value;
    const instructor = document.getElementById("instructorName").value;

    const params = new URLSearchParams();
    params.append("name", name);
    params.append("instructor", instructor);

    fetch("CourseServlet", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    })
    .then(() => {
        document.getElementById("addCourseForm").reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById("addCourseModal"));
        if (modal) {
            modal.hide();
        }
        loadCourses();
    })
    .catch(error => console.error("Error:", error));
}
