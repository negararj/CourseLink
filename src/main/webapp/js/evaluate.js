const container = document.getElementById("coursesContainer");
let courses = [];

document.addEventListener("DOMContentLoaded", loadCourses);

function loadCourses() {
    container.innerHTML = `<p class="text-muted">Loading courses...</p>`;

    fetch("CourseServlet")
        .then(response => response.json())
        .then(data => {
            courses = data;
            renderCourses();
        })
        .catch(error => {
            console.error("Error:", error);
            container.innerHTML = `<p class="text-danger">Could not load courses.</p>`;
        });
}

function renderCourses() {
    container.innerHTML = "";

    if (courses.length === 0) {
        container.innerHTML = `<p class="text-muted">No courses available for grade tracking yet.</p>`;
        return;
    }

    courses.forEach((course, index) => {
        container.innerHTML += `
            <div class="col-md-6 col-xl-4 mb-4">
                <div class="feature-card p-4 h-100 d-flex flex-column course-card" data-index="${index}" style="cursor:pointer;">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="feature-icon one" style="width:45px; height:45px; font-size:1.2rem;">CL</div>
                        <div class="grade-badge">-</div>
                    </div>
                    <h5 class="fw-bold mb-1">${course.name}</h5>
                    <p class="text-muted small mb-0">${course.instructor}</p>

                    <div class="course-meta">
                        <span>Credits not set</span>
                        <span>Backend course</span>
                    </div>

                    <div class="course-actions mt-auto">
                        <a href="Materials.html?courseId=${encodeURIComponent(course.id)}"
                           onclick="event.stopPropagation()"
                           class="btn btn-sm btn-outline-primary flex-grow-1">
                            Materials
                        </a>

                        <button onclick="event.stopPropagation(); openCourse(${index})"
                                class="btn btn-sm btn-primary flex-grow-1">
                            Track Grades
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    document.querySelectorAll(".course-card").forEach(card => {
        card.addEventListener("click", function () {
            openCourse(Number(this.getAttribute("data-index")));
        });
    });
}

function openCourse(index) {
    const course = courses[index];

    window.location.href =
        `GradeTracker.html?name=${encodeURIComponent(course.name)}&instructor=${encodeURIComponent(course.instructor)}&credits=0&grade=0`;
}
