function showTab(tabId, button) {
    document.querySelectorAll(".tab-content-section").forEach(section => {
        section.classList.add("d-none");
    });

    document.getElementById(tabId).classList.remove("d-none");

    document.querySelectorAll(".nav-pills .nav-link").forEach(tabButton => {
        tabButton.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }
}

const params = new URLSearchParams(window.location.search);
const requestedCourse = (params.get("courseId") || params.get("course") || params.get("name") || "").trim();
let selectedCourse = null;

document.addEventListener("DOMContentLoaded", () => {
    loadCourseDetail();
    renderfaqs();
});

function loadCourseDetail() {
    if (!requestedCourse) {
        showCourseFallback();
        renderAssessmentError("Open this page from My Courses to see assessment details.");
        renderClassmatesError("Open this page from My Courses to see classmates.");
        return;
    }

    fetch("CourseServlet", { credentials: "same-origin" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load courses.");
            }
            return response.json();
        })
        .then(courses => {
            selectedCourse = findCourse(courses || [], requestedCourse);

            if (!selectedCourse) {
                showCourseFallback();
                renderAssessmentError("This course could not be found.");
                renderClassmatesError("This course could not be found.");
                return;
            }

            renderCourseHeader(selectedCourse);
            renderCourseLists(selectedCourse);
            loadAssessments(selectedCourse);
            loadCourseAverage(selectedCourse);
            loadClassmates(selectedCourse);
        })
        .catch(error => {
            console.error("Course Detail Error:", error);
            showCourseFallback();
            renderAssessmentError("Could not load this course from the database.");
            renderClassmatesError("Could not load classmates.");
        });
}

function findCourse(courses, requested) {
    const normalized = normalize(requested);

    return courses.find(course =>
        normalize(course.id) === normalized ||
        normalize(course.courseCode) === normalized ||
        normalize(course.name) === normalized
    );
}

function renderCourseHeader(course) {
    document.getElementById("courseTitle").innerText = course.name || "Course";
    document.getElementById("courseInstructor").innerText = course.instructor || "-";
    document.getElementById("courseCredits").innerText = course.credits || "-";
    document.getElementById("courseGrade").innerText = "-";

    const materialsBtn = document.getElementById("materialsBtn");
    materialsBtn.href = `Materials.html?courseId=${encodeURIComponent(course.id)}`;
    materialsBtn.innerText = `${course.name} Materials`;

    const gradeTrackerBtn = document.getElementById("gradeTrackerBtn");
    gradeTrackerBtn.href = `GradeTracker.html?name=${encodeURIComponent(course.name || course.id)}`;
}

function showCourseFallback() {
    const fallbackName = requestedCourse || "Course";
    document.getElementById("courseTitle").innerText = fallbackName;
    document.getElementById("courseInstructor").innerText = "-";
    document.getElementById("courseCredits").innerText = "-";
    document.getElementById("courseGrade").innerText = "-";
}

const courseDetails = {
    "Intro to Programming": {
        prereq: ["None"],
        unlocks: ["Data Structures", "Object-Oriented Programming"]
    },
    "Calculus II": {
        prereq: ["Calculus I"],
        unlocks: ["Differential Equations", "Linear Algebra"]
    },
    "Academic Writing": {
        prereq: ["English Composition"],
        unlocks: ["Research Writing"]
    }
};

function renderCourseLists(course) {
    const details = courseDetails[course.name] || {
        prereq: ["Not specified"],
        unlocks: ["Not specified"]
    };

    renderList("prereqList", details.prereq);
    renderList("unlockList", details.unlocks);
}

function renderList(elementId, items) {
    const list = document.getElementById(elementId);
    list.innerHTML = "";

    items.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = item;
        list.appendChild(li);
    });
}

function loadAssessments(course) {
    const courseKey = course.id || course.courseCode || course.name;

    fetch(`AssessmentServlet?course=${encodeURIComponent(courseKey)}`, { credentials: "same-origin" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load assessments.");
            }
            return response.json();
        })
        .then(assessments => {
            renderAssessmentBreakdown(assessments || []);
            renderGradingScheme(assessments || []);
        })
        .catch(error => {
            console.error("Assessment Load Error:", error);
            renderAssessmentError("Could not load instructor assessments.");
        });
}

function loadCourseAverage(course) {
    const courseKey = course.name || course.courseCode || course.id;
    const query = new URLSearchParams({
        course: courseKey,
        target: "90"
    });

    fetch(`GradeTrackerServlet?${query.toString()}`, { credentials: "same-origin" })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) {
                return;
            }

            document.getElementById("courseGrade").innerText = formatNumber(data.currentAverage || 0);
        })
        .catch(error => {
            console.error("Course Average Error:", error);
        });
}

function loadClassmates(course) {
    const container = document.getElementById("classmatesContainer");
    container.innerHTML = `<p class="text-muted">Loading classmates...</p>`;

    fetch(`api/course-classmates?courseId=${encodeURIComponent(course.id)}`, { credentials: "same-origin" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load classmates.");
            }
            return response.json();
        })
        .then(data => {
            renderClassmates(data.classmates || []);
        })
        .catch(error => {
            console.error("Classmates Load Error:", error);
            renderClassmatesError("Could not load classmates for this course.");
        });
}

function renderClassmates(classmates) {
    const container = document.getElementById("classmatesContainer");
    container.innerHTML = "";

    if (!classmates.length) {
        container.innerHTML = `<p class="text-muted">No classmates are enrolled in this course yet.</p>`;
        return;
    }

    classmates.forEach(classmate => {
        const name = classmate.fullName || `${classmate.firstName || ""} ${classmate.lastName || ""}`.trim() || "Classmate";
        container.innerHTML += `
            <div class="card p-3 mb-2 d-flex flex-row justify-content-between align-items-center">
                <div>
                    <span class="fw-semibold">${escapeHtml(name)}</span>
                    ${classmate.major ? `<div class="small text-muted">${escapeHtml(classmate.major)}</div>` : ""}
                </div>
                <a href="Chat.html?user=${encodeURIComponent(name)}" class="text-decoration-none fs-5" aria-label="Message ${escapeHtml(name)}">
                    <i class="bi bi-envelope-fill"></i>
                </a>
            </div>
        `;
    });
}

function renderClassmatesError(message) {
    document.getElementById("classmatesContainer").innerHTML = `
        <p class="text-danger">${escapeHtml(message)}</p>
    `;
}

function renderAssessmentBreakdown(assessments) {
    const table = document.getElementById("gradeDistributionTable");
    table.innerHTML = "";

    if (!assessments.length) {
        table.innerHTML = `
            <tr>
                <td colspan="2" class="text-muted">No published assessments found for this course.</td>
            </tr>
        `;
        return;
    }

    assessments.forEach((assessment, index) => {
        const dateLabel = assessment.date ? formatDate(assessment.date) : "No date";
        const materialsUrl = `Materials.html?courseId=${encodeURIComponent(selectedCourse.id)}&assessment=${encodeURIComponent(index)}`;
        const calendarUrl = `Calendar.html?course=${encodeURIComponent(selectedCourse.id)}`;

        table.innerHTML += `
            <tr>
                <td>
                    <a href="${materialsUrl}" class="text-decoration-none fw-bold text-primary">
                        ${escapeHtml(assessment.title)}
                    </a>
                    <span class="badge bg-light text-dark ms-2">
                        <a href="${calendarUrl}" class="text-decoration-none text-dark">${escapeHtml(dateLabel)}</a>
                    </span>
                    <div class="small text-muted">${escapeHtml(assessment.type || "Assessment")}${assessment.topic ? " | " + escapeHtml(assessment.topic) : ""}</div>
                </td>
                <td>${formatNumber(assessment.weightPercent)}%</td>
            </tr>
        `;
    });
}

function renderGradingScheme(assessments) {
    const table = document.getElementById("gradingSchemeTable");
    const summary = document.getElementById("gradingSchemeSummary");
    table.innerHTML = "";

    if (!assessments.length) {
        table.innerHTML = `
            <tr>
                <td colspan="2" class="text-muted">No grading weights have been published yet.</td>
            </tr>
        `;
        summary.innerText = "";
        return;
    }

    const totalsByType = assessments.reduce((totals, assessment) => {
        const type = assessment.type || "Assessment";
        totals[type] = (totals[type] || 0) + Number(assessment.weightPercent || 0);
        return totals;
    }, {});

    Object.keys(totalsByType).sort().forEach(type => {
        table.innerHTML += `
            <tr>
                <td>${escapeHtml(type)}</td>
                <td>${formatNumber(totalsByType[type])}%</td>
            </tr>
        `;
    });

    const totalWeight = assessments.reduce((sum, assessment) => sum + Number(assessment.weightPercent || 0), 0);
    summary.innerText = `Published assessment weight: ${formatNumber(totalWeight)}%.`;
}

function renderAssessmentError(message) {
    document.getElementById("gradeDistributionTable").innerHTML = `
        <tr>
            <td colspan="2" class="text-danger">${escapeHtml(message)}</td>
        </tr>
    `;
    document.getElementById("gradingSchemeTable").innerHTML = `
        <tr>
            <td colspan="2" class="text-danger">${escapeHtml(message)}</td>
        </tr>
    `;
    document.getElementById("gradingSchemeSummary").innerText = "";
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
        return dateStr;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return "0";
    }
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const faqsData = [];

function renderfaqs() {
    const container = document.getElementById("faqsContainer");
    container.innerHTML = "";

    faqsData.forEach((post, postIndex) => {
        container.innerHTML += createPostHTML(post, postIndex);
    });
}

function createPostHTML(post, postIndex) {
    let repliesHTML = "";

    post.replies.forEach((reply, replyIndex) => {
        repliesHTML += `
            <div class="reply">
                <div class="d-flex justify-content-between">
                    <span>${escapeHtml(reply.text)}</span>
                    <span class="vote" onclick="likeReply(${postIndex}, ${replyIndex})">
                        Like ${reply.likes}
                    </span>
                </div>
            </div>
        `;
    });

    return `
        <div class="card p-3 post">
            <div class="d-flex justify-content-between">
                <strong>Student</strong>
                <span class="vote" onclick="likePost(${postIndex})">Like ${post.likes}</span>
            </div>

            <p class="mt-2 mb-2">${escapeHtml(post.text)}</p>

            <div class="reply-box">
                <input type="text" id="replyInput-${postIndex}" class="form-control mb-2" placeholder="Reply...">
                <button class="btn btn-sm btn-outline-primary" onclick="addReply(${postIndex})">Reply</button>
            </div>

            ${repliesHTML}
        </div>
    `;
}

function addPost() {
    const text = document.getElementById("newPostText").value.trim();
    if (!text) return;

    faqsData.push({
        text: text,
        likes: 0,
        replies: []
    });

    document.getElementById("newPostText").value = "";
    renderfaqs();
}

function addReply(postIndex) {
    const input = document.getElementById(`replyInput-${postIndex}`);
    const text = input.value.trim();
    if (!text) return;

    faqsData[postIndex].replies.push({
        text: text,
        likes: 0
    });

    input.value = "";
    renderfaqs();
}

function likePost(index) {
    faqsData[index].likes++;
    renderfaqs();
}

function likeReply(postIndex, replyIndex) {
    faqsData[postIndex].replies[replyIndex].likes++;
    renderfaqs();
}
