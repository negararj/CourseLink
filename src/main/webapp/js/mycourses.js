document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    loadAvailableCourses();

    const form = document.getElementById("addCourseForm");
    if (form) {
        form.addEventListener("submit", addCourse);
    }
});

function loadCourses() {
    const container = document.getElementById("registered-courses-grid");
    container.innerHTML = `<p class="text-muted">Loading courses...</p>`;

    fetch("api/my-courses", {
        credentials: "same-origin"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load enrolled courses.");
            }
            return response.json();
        })
        .then(data => displayCourses(data.courses || []))
        .catch(error => {
            console.error("My Courses Error:", error);
            container.innerHTML = `<p class="text-danger">Could not load your courses.</p>`;
        });
}

function loadAvailableCourses() {
    const select = document.getElementById("availableCourse");
    if (!select) {
        return;
    }

    fetch("CourseServlet", {
        credentials: "same-origin"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load available courses.");
            }
            return response.json();
        })
        .then(courses => populateAvailableCourses(courses || []))
        .catch(error => {
            console.error("Available Courses Error:", error);
            select.innerHTML = `<option value="">Could not load courses</option>`;
        });
}

function populateAvailableCourses(courses) {
    const select = document.getElementById("availableCourse");
    select.innerHTML = "";

    if (courses.length === 0) {
        select.innerHTML = `<option value="">No instructor courses available</option>`;
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.appendChild(new Option("Choose a course", ""));

    courses.forEach(course => {
        const code = course.courseCode ? course.courseCode + " - " : "";
        const credits = course.credits || 3;
        const label = `${code}${course.name} (${course.instructor}, ${credits} credits)`;
        select.appendChild(new Option(label, course.id));
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
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 class="fw-bold mb-1">${escapeHtml(course.name)}</h5>
                        <p class="text-muted small mb-0">${escapeHtml(course.instructor)}</p>
                    </div>
                    <span class="badge rounded-pill text-bg-light">${escapeHtml(course.courseCode || "Course")}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${escapeHtml(course.credits || 3)} credits</small>
                    <a href="CourseDetail.html?course=${encodeURIComponent(course.courseCode || course.id || course.name)}" class="btn btn-sm btn-outline-primary rounded-pill px-3">View</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function addCourse(event) {
    event.preventDefault();

    const form = document.getElementById("addCourseForm");
    const submitButton = form.querySelector("button[type='submit']");
    const params = new URLSearchParams();

    params.append("courseId", document.getElementById("availableCourse").value);

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
    }

    fetch("api/my-courses", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    })
        .then(response => {
            if (!response.ok) {
                return response.json()
                    .catch(() => ({ message: "Could not register course." }))
                    .then(error => {
                        throw new Error(error.message || "Could not register course.");
                    });
            }
            return response.json();
        })
        .then(() => {
            form.reset();

            const modalElement = document.getElementById("addCourseModal");
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            loadCourses();
        })
        .catch(error => {
            console.error("Register Course Error:", error);
            alert(error.message);
        })
        .finally(() => {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Register Course";
            }
        });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
