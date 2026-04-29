function showTab(tabId) {
    document.querySelectorAll(".tab-content-section").forEach(el => {
        el.classList.add("d-none");
    });

    document.getElementById(tabId).classList.remove("d-none");

    document.querySelectorAll(".nav-pills .nav-link").forEach(btn => {
        btn.classList.remove("active");
    });

    event.target.classList.add("active");
}

// =========================
// GET DATA FROM URL
// =========================
const params = new URLSearchParams(window.location.search);

const courseName = params.get("name")?.trim();
const instructor = params.get("instructor");
const credits = params.get("credits");
const grade = params.get("grade");

document.getElementById("courseTitle").innerText = courseName || "Course";
document.getElementById("courseInstructor").innerText = instructor || "-";
document.getElementById("courseCredits").innerText = credits || "-";
document.getElementById("courseGrade").innerText = grade || "-";

// =========================
// PREREQUISITES + UNLOCKS
// =========================
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

const prereqList = document.getElementById("prereqList");
const unlockList = document.getElementById("unlockList");

prereqList.innerHTML = "";
unlockList.innerHTML = "";

const matchedDetails = Object.keys(courseDetails).find(
    key => key.toLowerCase() === courseName?.toLowerCase()
);

if (matchedDetails) {
    courseDetails[matchedDetails].prereq.forEach(item => {
        prereqList.innerHTML += `<li class="list-group-item">${item}</li>`;
    });

    courseDetails[matchedDetails].unlocks.forEach(item => {
        unlockList.innerHTML += `<li class="list-group-item">${item}</li>`;
    });
} else {
    prereqList.innerHTML = `<li class="list-group-item">Not specified</li>`;
    unlockList.innerHTML = `<li class="list-group-item">Not specified</li>`;
}

// =========================
// GRADE DISTRIBUTION
// =========================
const gradeDistributions = {
    "Intro to Programming": [
        { name: "Quiz 1", weight: 10, date: "2026-02-24" },
        { name: "Quiz 2", weight: 10, date: "2026-03-10" },
        { name: "Midterm Exam", weight: 25, date: "2026-03-25" },
        { name: "Homework", weight: 10, date: "2026-04-05" },
        { name: "Project", weight: 15, date: "2026-04-20" },
        { name: "Final Exam", weight: 30, date: "2026-05-15" }
    ],
    "Calculus II": [
        { name: "Quiz", weight: 15, date: "2026-02-24" },
        { name: "Midterm", weight: 35, date: "2026-03-20" },
        { name: "Final Exam", weight: 50, date: "2026-05-10" }
    ]
};

const distTable = document.getElementById("gradeDistributionTable");

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

const matchedCourse = Object.keys(gradeDistributions).find(
    key => key.toLowerCase() === courseName?.toLowerCase()
);

if (matchedCourse) {
    distTable.innerHTML = "";

    gradeDistributions[matchedCourse].forEach((item, index) => {
        distTable.innerHTML += `
                <tr>
                    <td>
                        <a href="Materials.html?course=${encodeURIComponent(courseName)}&assessment=${index}" 
                           class="text-decoration-none fw-bold text-primary">
                            ${item.name}
                        </a>
                        <span class="badge bg-light text-dark ms-2">
                            <a href="Calendar.html?date=${item.date}" 
                               onclick="event.stopPropagation()" 
                               class="text-decoration-none text-dark">
                                ${formatDate(item.date)}
                            </a>
                        </span>
                    </td>
                    <td>${item.weight}%</td>
                </tr>
            `;
    });
} else {
    distTable.innerHTML = `
            <tr>
                <td colspan="2">No assessment data available</td>
            </tr>
        `;
}

// =========================
// MATERIAL BUTTON LINK
// =========================
const materialsBtn = document.getElementById("materialsBtn");

if (courseName) {
    materialsBtn.href = `Materials.html?course=${encodeURIComponent(courseName)}`;
    materialsBtn.innerText = `${courseName} Materials`;
}

// =========================
// FAQs
// =========================
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
                    <span>${reply.text}</span>
                    <span class="vote" onclick="likeReply(${postIndex}, ${replyIndex})">
                        👍 ${reply.likes}
                    </span>
                </div>
            </div>
        `;
    });

    return `
        <div class="card p-3 post">
            <div class="d-flex justify-content-between">
                <strong>Student</strong>
                <span class="vote" onclick="likePost(${postIndex})">👍 ${post.likes}</span>
            </div>

            <p class="mt-2 mb-2">${post.text}</p>

            <!-- Reply Input -->
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