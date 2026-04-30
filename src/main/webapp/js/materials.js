let courses = [];

// Assessment data stays static for this step. We are only connecting the course list.
const assessmentData = {
    "Intro to Programming": [
        {
            name: "Quiz 1",
            type: "quiz",
            weight: 10,
            date: "2026-02-24",
            chapters: ["Chapter 1: Introduction", "Chapter 2: Variables & Data Types"],
            instructions: "Answer 10 multiple choice questions. Time limit: 30 minutes."
        },
        {
            name: "Midterm Exam",
            type: "midterm",
            weight: 25,
            date: "2026-03-25",
            chapters: ["Chapter 1-4: All topics covered", "Problem solving & debugging"],
            instructions: "2-hour exam covering all topics. Bring calculator. No notes allowed."
        }
    ],
    "Calculus II": [
        {
            name: "Quiz",
            type: "quiz",
            weight: 15,
            date: "2026-02-24",
            chapters: ["Chapter 1: Integration techniques"],
            instructions: "10 problems on integration methods. Time limit: 45 minutes."
        },
        {
            name: "Final Exam",
            type: "exam",
            weight: 50,
            date: "2026-05-10",
            chapters: ["Chapters 1-6: Comprehensive"],
            instructions: "3-hour final exam covering entire course."
        }
    ]
};

const cardContainer = document.getElementById("course-card-container");
const detailSection = document.getElementById("course-detail-section");
const gridSection = document.getElementById("course-grid-section");

document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    setupButtons();
});

function loadCourses() {
    cardContainer.innerHTML = `<p class="text-muted">Loading courses...</p>`;

    fetch("CourseServlet")
        .then(response => response.json())
        .then(data => {
            courses = data;
            renderCourses();
            openCourseFromUrl();
        })
        .catch(error => {
            console.error("Error:", error);
            cardContainer.innerHTML = `<p class="text-danger">Could not load courses.</p>`;
        });
}

function renderCourses(filter = "all", search = "") {
    cardContainer.innerHTML = "";

    const filtered = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    if (filtered.length === 0) {
        cardContainer.innerHTML = `<p class="text-muted">No courses found.</p>`;
        return;
    }

    filtered.forEach(course => {
        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";
        card.innerHTML = `
            <div class="course-card-ui" role="button">
                <span class="badge bg-light text-muted mb-2">Course</span>
                <h5 class="fw-bold">${course.name}</h5>
                <p class="small text-muted mb-0">${course.instructor}</p>
            </div>
        `;

        card.querySelector(".course-card-ui").addEventListener("click", () => {
            showCourse(course.name);
        });

        cardContainer.appendChild(card);
    });
}

function renderAssessments(courseName) {
    const assessmentContainer = document.getElementById("assessment-container");
    const assessments = assessmentData[courseName] || [];

    assessmentContainer.innerHTML = "";

    if (assessments.length === 0) {
        assessmentContainer.innerHTML = `<p class="text-muted">No assessments available for this course yet.</p>`;
        return;
    }

    assessments.forEach((assessment, index) => {
        const assessmentCard = document.createElement("div");
        assessmentCard.className = "col-md-6 col-lg-4";
        assessmentCard.innerHTML = `
            <div class="assessment-card p-4 border rounded-3 cursor-pointer" role="button">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="fw-bold mb-0">${assessment.name}</h5>
                    <span class="badge bg-primary">${assessment.weight}%</span>
                </div>
                <p class="text-muted small mb-2">${assessment.type}</p>
                <p class="small mb-0">${new Date(assessment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
        `;

        assessmentCard.querySelector(".assessment-card").addEventListener("click", () => {
            showAssessmentDetails(courseName, index);
        });

        assessmentContainer.appendChild(assessmentCard);
    });
}

function showAssessmentDetails(courseName, assessmentIndex) {
    const assessment = assessmentData[courseName][assessmentIndex];
    const detailsSection = document.getElementById("assessment-details-section");
    const chaptersHtml = assessment.chapters.map(chapter => `<li class="list-group-item">${chapter}</li>`).join("");

    detailsSection.innerHTML = `
        <button class="btn btn-sm btn-link mb-3 p-0 text-decoration-none" onclick="hideAssessmentDetails()">Back to assessments</button>
        <div class="card p-4">
            <h3 class="fw-bold mb-2">${assessment.name}</h3>
            <p class="text-muted mb-4">Weight: <strong>${assessment.weight}%</strong> | Due: <strong>${new Date(assessment.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></p>

            <div class="row">
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">Chapters Covered</h5>
                    <ul class="list-group list-group-flush">
                        ${chaptersHtml}
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">Instructions</h5>
                    <p class="text-muted">${assessment.instructions}</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById("course-assessments-section").classList.add("d-none");
    detailsSection.classList.remove("d-none");
}

function hideAssessmentDetails() {
    document.getElementById("assessment-details-section").classList.add("d-none");
    document.getElementById("course-assessments-section").classList.remove("d-none");
}

function showCourse(name) {
    gridSection.classList.add("d-none");
    detailSection.classList.remove("d-none");
    document.getElementById("selected-course-title").innerText = name;
    renderAssessments(name);
}

function setupButtons() {
    document.getElementById("back-to-list").addEventListener("click", () => {
        detailSection.classList.add("d-none");
        gridSection.classList.remove("d-none");
        hideAssessmentDetails();
    });

    document.getElementById("courseSearch").addEventListener("input", event => {
        renderCourses("all", event.target.value);
    });

    document.getElementById("all-courses-btn").addEventListener("click", () => {
        document.getElementById("all-courses-btn").classList.add("active");
        document.getElementById("my-courses-btn").classList.remove("active");
        renderCourses("all", document.getElementById("courseSearch").value);
    });

    document.getElementById("my-courses-btn").addEventListener("click", () => {
        document.getElementById("my-courses-btn").classList.add("active");
        document.getElementById("all-courses-btn").classList.remove("active");
        renderCourses("my", document.getElementById("courseSearch").value);
    });
}

function openCourseFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseToOpen = urlParams.get("course");
    const assessmentToShow = urlParams.get("assessment");

    if (courseToOpen) {
        showCourse(courseToOpen);

        if (assessmentToShow !== null) {
            showAssessmentDetails(courseToOpen, parseInt(assessmentToShow));
        }
    }
}
