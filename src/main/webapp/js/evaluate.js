const courses = [
    { name: "Intro to Programming", instructor: "Dr. Ahmed", credits: 3, average: 88 },
    { name: "Calculus II", instructor: "Dr. Sara", credits: 4, average: 75 }
];

// Function to convert percentage to letter grade
function getLetterGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
}

const container = document.getElementById("coursesContainer");

courses.forEach((course, index) => {
    const letterGrade = getLetterGrade(course.average);
    container.innerHTML += `
                <div class="col-md-6 col-xl-4">
                    <div class="feature-card p-4 h-100 d-flex flex-column course-card" data-index="${index}" style="cursor:pointer;">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="feature-icon one" style="width:45px; height:45px; font-size:1.2rem;">📚</div>
                            <div class="grade-badge">${letterGrade}</div>
                        </div>
                        <h5 class="fw-bold mb-1">${course.name}</h5>
                        <p class="text-muted small mb-0">${course.instructor}</p>
                        
                        <div class="course-meta">
                            <span>🕒 ${course.credits} Credits</span>
                            <span>📊 Current Avg</span>
                        </div>

                        <div class="course-actions mt-auto">
                            <a href="Materials.html?course=${encodeURIComponent(course.name)}" 
                                onclick="event.stopPropagation()" 
                                class="btn btn-sm btn-outline-primary flex-grow-1">
                                Materials
                            </a>

                            <button onclick="event.stopPropagation(); openCourse('${course.name}')" 
                                class="btn btn-sm btn-primary flex-grow-1">
                                Track Grades
                            </button>
                        </div>
                    </div>
                </div>
            `;
});

// Add click event to each course card
document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', function () {
        const index = this.getAttribute('data-index');
        const course = courses[index];

        window.location.href =
            `GradeTracker.html?name=${encodeURIComponent(course.name)}&instructor=${encodeURIComponent(course.instructor)}&credits=${course.credits}&grade=${course.average}`;
    });
});

function openCourse(name) {
    window.location.href = `GradeTracker.html?course=${encodeURIComponent(name)}`;
}