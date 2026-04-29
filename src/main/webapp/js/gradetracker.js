// Get URL parameters
const params = new URLSearchParams(window.location.search);
const courseName = params.get("name");
const courseInstructor = params.get("instructor");
const courseCredits = params.get("credits");
const courseGrade = params.get("grade");

// Set course title
if (courseName) {
    document.getElementById("courseTitle").innerText = courseName;
}

// Define grade assessments by course
const gradeAssessments = {
    "Intro to Programming": [
        { name: "Quiz 1", weight: 10, grade: 85 },
        { name: "Quiz 2", weight: 10, grade: 90 },
        { name: "Midterm Exam", weight: 25, grade: 88 },
        { name: "Homework", weight: 10, grade: 92 },
        { name: "Project", weight: 15, grade: 88 },
        { name: "Final Exam", weight: 30, grade: 85 }
    ],
    "Calculus II": [
        { name: "Quiz", weight: 15, grade: 70 },
        { name: "Midterm", weight: 35, grade: 75 },
        { name: "Final Exam", weight: 50, grade: 78 }
    ]
};

// Load assessments for the course
const assessments = gradeAssessments[courseName] || [];
const gradeTableBody = document.getElementById("gradeTable");

assessments.forEach((assessment, index) => {
    gradeTableBody.innerHTML += `
                <tr>
                    <td>${assessment.name}</td>
                    <td>${assessment.weight}%</td>
                    <td><input type="number" class="form-control grade-input" data-index="${index}" min="0" max="100" value="${assessment.grade}"></td>
                </tr>
            `;
});

// Function to calculate and update current average
function updateAverage() {
    let totalWeightedGrade = 0;
    let totalWeight = 0;

    document.querySelectorAll('.grade-input').forEach((input, index) => {
        const grade = parseFloat(input.value) || 0;
        const weight = assessments[index].weight;
        totalWeightedGrade += (grade * weight) / 100;
        totalWeight += weight;
    });

    const currentAverage = totalWeight > 0 ? Math.round(totalWeightedGrade) : 0;
    document.getElementById("currentAvg").innerText = currentAverage + "%";
    document.getElementById("maxGrade").innerText = "100%";

    // Update progress bar
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = currentAverage + "%";

    // Update remaining based on target grade
    const targetGradeSelect = document.getElementById("targetGrade");
    const targetGrade = parseInt(targetGradeSelect.value);
    const remaining = Math.max(0, currentAverage - targetGrade);
    let targetLetter = 'A';
    if (targetGrade === 80) targetLetter = 'B';
    else if (targetGrade === 70) targetLetter = 'C';
    else if (targetGrade === 60) targetLetter = 'D';
    document.getElementById("remaining").innerText = remaining + "%";
    document.getElementById("targetGradeLetter").innerText = targetLetter;
}

// Add event listeners to all grade inputs
document.querySelectorAll('.grade-input').forEach(input => {
    input.addEventListener('change', updateAverage);
    input.addEventListener('input', updateAverage);
});

// Handle target grade selection
document.getElementById("targetGrade").addEventListener("change", function () {
    updateAverage();
});

// Initial calculation
updateAverage();