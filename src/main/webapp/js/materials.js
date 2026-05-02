let courses = [];
let selectedCourse = null;
let selectedAssessments = [];

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
            showCourse(course);
        });

        cardContainer.appendChild(card);
    });
}

function renderAssessments(course) {
    const assessmentContainer = document.getElementById("assessment-container");
    assessmentContainer.innerHTML = `<p class="text-muted">Loading assessments...</p>`;

    fetch(`AssessmentServlet?course=${encodeURIComponent(course.id)}`)
        .then(response => response.json())
        .then(assessments => {
            selectedAssessments = assessments;
            assessmentContainer.innerHTML = "";

            if (!assessments.length) {
                assessmentContainer.innerHTML = `<p class="text-muted">No assessments available for this course yet.</p>`;
                return;
            }

            assessments.forEach((assessment, index) => {
                const assessmentCard = document.createElement("div");
                assessmentCard.className = "col-md-6 col-lg-4";
                assessmentCard.innerHTML = `
                    <div class="assessment-card p-4 border rounded-3 cursor-pointer" role="button">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="fw-bold mb-0">${assessment.title}</h5>
                            <span class="badge bg-primary">${assessment.weightPercent}%</span>
                        </div>
                        <p class="text-muted small mb-2">${assessment.type}</p>
                        <p class="small mb-0">${formatDate(assessment.date)}</p>
                    </div>
                `;

                assessmentCard.querySelector(".assessment-card").addEventListener("click", () => {
                    showAssessmentDetails(index);
                });

                assessmentContainer.appendChild(assessmentCard);
            });
        })
        .catch(error => {
            console.error("Assessment Load Error:", error);
            assessmentContainer.innerHTML = `<p class="text-danger">Could not load assessments.</p>`;
        });
}

function showAssessmentDetails(assessmentIndex) {
    const assessment = selectedAssessments[assessmentIndex];
    if (!assessment) {
        return;
    }

    const detailsSection = document.getElementById("assessment-details-section");

    detailsSection.innerHTML = `
        <button class="btn btn-sm btn-link mb-3 p-0 text-decoration-none" onclick="hideAssessmentDetails()">Back to assessments</button>
        <div class="card p-4">
            <h3 class="fw-bold mb-2">${assessment.title}</h3>
            <p class="text-muted mb-4">Weight: <strong>${assessment.weightPercent}%</strong> | Due: <strong>${formatDate(assessment.date, true)}</strong></p>

            <div class="row">
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">Topic Covered</h5>
                    <p class="text-muted">${assessment.topic || "No topic has been added yet."}</p>
                </div>
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">Instructions</h5>
                    <p class="text-muted">${assessment.instructions || "No instructions have been added yet."}</p>
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

function showCourse(course) {
    selectedCourse = course;
    gridSection.classList.add("d-none");
    detailSection.classList.remove("d-none");
    document.getElementById("selected-course-title").innerText = course.name;
    renderAssessments(course);
    renderMaterials(course);
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
    const courseToOpen = urlParams.get("courseId") || urlParams.get("course");
    const assessmentToShow = urlParams.get("assessment");

    if (courseToOpen) {
        const course = courses.find(item => String(item.id) === courseToOpen || item.name === courseToOpen);
        if (!course) {
            return;
        }

        showCourse(course);

        if (assessmentToShow !== null) {
            setTimeout(() => showAssessmentDetails(parseInt(assessmentToShow)), 300);
        }
    }
}

function renderMaterials(course) {
    const section = document.getElementById("course-materials-section");
    section.innerHTML = `<p class="text-muted">Loading materials...</p>`;

    fetch(`api/upload-material?courseId=${encodeURIComponent(course.id)}`)
        .then(response => response.json())
        .then(materials => {
            section.innerHTML = "";

            if (!materials.length) {
                section.innerHTML = `<p class="text-muted">No materials uploaded for this course yet.</p>`;
                return;
            }

            materials.forEach(material => {
                const card = document.createElement("div");
                card.className = "col-md-6 col-lg-3";
                card.innerHTML = `
                    <div class="category-card h-100">
                        <h5>${material.title}</h5>
                        <p class="small text-muted mb-2">${material.category}</p>
                        <p class="small text-muted">${formatDate(material.uploadDate)}</p>
                        <a class="btn btn-sm btn-outline-primary" href="${material.filePath}" target="_blank">Open file</a>
                    </div>
                `;
                section.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Materials Load Error:", error);
            section.innerHTML = `<p class="text-danger">Could not load materials.</p>`;
        });
}

function formatDate(value, long = false) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleDateString("en-US", long
        ? { month: "long", day: "numeric", year: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" });
}
