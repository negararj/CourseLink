const params = new URLSearchParams(window.location.search);
const courseName = params.get("name");

const gradeTableBody = document.getElementById("gradeTable");
const targetGradeSelect = document.getElementById("targetGrade");
let gradeData = null;
let saveTimer = null;

if (courseName) {
    document.getElementById("courseTitle").innerText = courseName;
}

document.addEventListener("DOMContentLoaded", function () {
    targetGradeSelect.addEventListener("change", loadGrades);
    loadGrades();
});

function loadGrades() {
    if (!courseName) {
        showError("No course selected.");
        return;
    }

    gradeTableBody.innerHTML = `
        <tr>
            <td colspan="3" class="text-muted">Loading grades...</td>
        </tr>
    `;

    const query = new URLSearchParams({
        course: courseName,
        target: targetGradeSelect.value
    });

    fetch(`GradeTrackerServlet?${query.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load grades.");
            }
            return response.json();
        })
        .then(data => {
            gradeData = data;
            renderGrades(data);
            renderSummary(data);
        })
        .catch(error => {
            console.error("Grade Tracker Error:", error);
            showError("Could not load grade data from the database.");
        });
}

function renderGrades(data) {
    gradeTableBody.innerHTML = "";

    if (!data.assessments || data.assessments.length === 0) {
        gradeTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-muted">No published assessments found for this course.</td>
            </tr>
        `;
        return;
    }

    data.assessments.forEach(assessment => {
        const score = assessment.scorePercent === null || assessment.scorePercent === undefined
            ? ""
            : formatNumber(assessment.scorePercent);

        gradeTableBody.innerHTML += `
            <tr>
                <td>${escapeHtml(assessment.title)}</td>
                <td>${formatNumber(assessment.weightPercent)}%</td>
                <td>
                    <input type="number"
                           class="form-control grade-input"
                           min="0"
                           max="100"
                           step="0.01"
                           data-assessment-id="${assessment.id}"
                           value="${score}"
                           placeholder="Not graded">
                </td>
            </tr>
        `;
    });

    document.querySelectorAll(".grade-input").forEach(input => {
        input.addEventListener("input", function () {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => saveGrade(this), 450);
        });

        input.addEventListener("change", function () {
            clearTimeout(saveTimer);
            saveGrade(this);
        });
    });
}

function saveGrade(input) {
    const score = input.value.trim();
    const numericScore = score === "" ? null : Number(score);

    if (numericScore !== null && (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100)) {
        input.classList.add("is-invalid");
        return;
    }

    input.classList.remove("is-invalid");
    input.disabled = true;

    const body = new URLSearchParams();
    body.append("assessmentId", input.dataset.assessmentId);
    body.append("score", score);

    fetch("GradeTrackerServlet", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not save grade.");
            }
            return response.json();
        })
        .then(loadGrades)
        .catch(error => {
            console.error("Grade Save Error:", error);
            input.classList.add("is-invalid");
            alert("Could not save this grade.");
        })
        .finally(() => {
            input.disabled = false;
            input.focus();
        });
}

function renderSummary(data) {
    const currentAverage = Number(data.currentAverage || 0);
    const maxAchievable = Number(data.maxAchievable || 0);
    const targetGrade = Number(data.targetGrade || targetGradeSelect.value);
    const required = data.requiredOnRemaining;

    document.getElementById("currentAvg").innerText = `${formatNumber(currentAverage)}%`;
    document.getElementById("maxGrade").innerText = `${formatNumber(maxAchievable)}%`;
    document.getElementById("targetGradeLetter").innerText = targetLetter(targetGrade);

    if (required === null || required === undefined) {
        const lockedMessage = currentAverage >= targetGrade ? "0%" : "Target missed";
        document.getElementById("remaining").innerText = lockedMessage;
    } else {
        document.getElementById("remaining").innerText = `${formatNumber(Math.max(0, required))}% average`;
    }

    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = `${Math.min(100, Math.max(0, currentAverage))}%`;
}

function showError(message) {
    gradeTableBody.innerHTML = `
        <tr>
            <td colspan="3" class="text-danger">${escapeHtml(message)}</td>
        </tr>
    `;
    document.getElementById("currentAvg").innerText = "0%";
    document.getElementById("maxGrade").innerText = "0%";
    document.getElementById("remaining").innerText = "0%";
    document.getElementById("progressBar").style.width = "0%";
}

function targetLetter(targetGrade) {
    if (targetGrade >= 90) return "A";
    if (targetGrade >= 80) return "B";
    if (targetGrade >= 70) return "C";
    if (targetGrade >= 60) return "D";
    return "target";
}

function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return "0";
    }
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
