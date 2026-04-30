// Mock Data
let registeredCourses = [
    { name: "Intro to Programming", instructor: "Prof. Ahmed", average: 88, credits: 3 },
    { name: "Calculus II", instructor: "Prof. Miller", average: 75, credits: 4 },
    { name: "Academic Writing", instructor: "Dr. Sarah", average: 92, credits: 3 }
];

const grid = document.getElementById('registered-courses-grid');

// Function to render the cards
function renderMyCourses() {
    grid.innerHTML = '';
    registeredCourses.forEach((course, index) => {
        grid.innerHTML += `
            <div class="col-md-6 col-xl-4">
                <div class="feature-card p-4 h-100 d-flex flex-column course-card" data-index="${index}" style="cursor:pointer;">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="feature-icon one" style="width:45px; height:45px; font-size:1.2rem;">📚</div>
                        <div class="grade-badge">${course.average}%</div>
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

                        <a href="Evaluate.html" 
                            onclick="event.stopPropagation()" 
                            class="btn btn-sm btn-primary flex-grow-1">
                            Track Grades
                        </a>
                    </div>
                </div>
            </div>
        `;
        // Add click event to each course card
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                const course = registeredCourses[index];

                window.location.href =
                    `CourseDetail.html?name=${encodeURIComponent(course.name)}&instructor=${encodeURIComponent(course.instructor)}&credits=${course.credits}&grade=${course.average}`;
            });
        });
    });
}

// Handle Form Submission
document.getElementById('addCourseForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newCourse = {
        name: document.getElementById('courseName').value,
        instructor: document.getElementById('instructorName').value,
        credits: document.getElementById('courseCredits').value,
        average: document.getElementById('initialGrade').value || 0
    };

    registeredCourses.push(newCourse);
    renderMyCourses();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCourseModal'));
    modal.hide();
    this.reset();
});

// Initial Load
renderMyCourses();
