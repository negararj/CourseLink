// Mock Data
const courses = [
    { id: 1, name: "Intro to Programming", dept: "Computer Science", enrolled: true },
    { id: 2, name: "Calculus II", dept: "Mathematics", enrolled: false },
    { id: 3, name: "Academic Writing", dept: "English", enrolled: true },
    { id: 4, name: "Web Application Programming", dept: "Computer Science", enrolled: true}
];

// Assessment Data with Chapters and Instructions
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
            name: "Quiz 2", 
            type: "quiz",
            weight: 10, 
            date: "2026-03-10",
            chapters: ["Chapter 3: Control Flow", "Chapter 4: Functions"],
            instructions: "Answer 10 multiple choice questions. Time limit: 30 minutes."
        },
        { 
            name: "Midterm Exam", 
            type: "midterm",
            weight: 25, 
            date: "2026-03-25",
            chapters: ["Chapter 1-4: All topics covered", "Problem solving & debugging"],
            instructions: "2-hour exam covering all topics. Bring calculator. No notes allowed."
        },
        { 
            name: "Homework", 
            type: "homework",
            weight: 10, 
            date: "2026-04-05",
            chapters: ["Chapter 1-4: Practical exercises"],
            instructions: "Submit 5 programming exercises. Each program should demonstrate the concepts learned."
        },
        { 
            name: "Project", 
            type: "project",
            weight: 15, 
            date: "2026-04-20",
            chapters: ["Chapters 1-5: Integration of concepts"],
            instructions: "Build a command-line application. Must include user input, functions, loops, and conditions. Submit code and documentation."
        },
        { 
            name: "Final Exam", 
            type: "exam",
            weight: 30, 
            date: "2026-05-15",
            chapters: ["Chapters 1-6: Comprehensive review"],
            instructions: "3-hour comprehensive exam. 50% multiple choice, 50% coding problems."
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
            name: "Midterm", 
            type: "midterm",
            weight: 35, 
            date: "2026-03-20",
            chapters: ["Chapters 1-3: All covered topics"],
            instructions: "2-hour exam. Bring scientific calculator. Show all work."
        },
        { 
            name: "Final Exam", 
            type: "exam",
            weight: 50, 
            date: "2026-05-10",
            chapters: ["Chapters 1-6: Comprehensive"],
            instructions: "3-hour final exam covering entire course."
        }
    ],
    "Academic Writing": [
        { 
            name: "Essay 1", 
            type: "homework",
            weight: 20, 
            date: "2026-03-01",
            chapters: ["Chapter 1: Essay structure", "Chapter 2: Thesis statements"],
            instructions: "Write a 3-5 page argumentative essay. MLA format required. Include at least 3 sources."
        },
        { 
            name: "Essay 2", 
            type: "homework",
            weight: 20, 
            date: "2026-04-10",
            chapters: ["Chapter 3: Research", "Chapter 4: Citations"],
            instructions: "Write a 4-6 page research paper. Proper citations required. Peer review included."
        },
        { 
            name: "Final Project", 
            type: "project",
            weight: 30, 
            date: "2026-05-01",
            chapters: ["All chapters: Portfolio"],
            instructions: "Create writing portfolio with 5 revised pieces. Include reflection on growth."
        }
    ]
};

const cardContainer = document.getElementById('course-card-container');
const detailSection = document.getElementById('course-detail-section');
const gridSection = document.getElementById('course-grid-section');

// Function to Render Courses
function renderCourses(filter = 'all', search = '') {
    cardContainer.innerHTML = '';
    const filtered = courses.filter(c => {
        const matchesFilter = filter === 'all' || (filter === 'my' && c.enrolled);
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    filtered.forEach(course => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="course-card-ui" onclick="showCourse('${course.name}')">
                <span class="badge bg-light text-muted mb-2">${course.dept}</span>
                <h5 class="fw-bold">${course.name}</h5>
                <p class="small text-muted mb-0">Click to view assessments</p>
            </div>
        `;
        cardContainer.appendChild(card);
    });
}

// Function to render assessments for a course
function renderAssessments(courseName) {
    const assessmentContainer = document.getElementById('assessment-container');
    const assessments = assessmentData[courseName] || [];
    
    assessmentContainer.innerHTML = '';
    
    if (assessments.length === 0) {
        assessmentContainer.innerHTML = '<p class="text-muted">No assessments available for this course.</p>';
        return;
    }
    
    assessments.forEach((assessment, index) => {
        const assessmentCard = document.createElement('div');
        assessmentCard.className = 'col-md-6 col-lg-4';
        assessmentCard.innerHTML = `
            <div class="assessment-card p-4 border rounded-3 cursor-pointer" onclick="showAssessmentDetails('${courseName}', ${index})">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="fw-bold mb-0">${assessment.name}</h5>
                    <span class="badge bg-primary">${assessment.weight}%</span>
                </div>
                <p class="text-muted small mb-2">${assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}</p>
                <p class="small mb-0">📅 ${new Date(assessment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
        `;
        assessmentContainer.appendChild(assessmentCard);
    });
}

// Function to show assessment details
function showAssessmentDetails(courseName, assessmentIndex) {
    const assessment = assessmentData[courseName][assessmentIndex];
    const detailsSection = document.getElementById('assessment-details-section');
    
    let chaptersHtml = assessment.chapters.map(ch => `<li class="list-group-item">${ch}</li>`).join('');
    
    detailsSection.innerHTML = `
        <button class="btn btn-sm btn-link mb-3 p-0 text-decoration-none" onclick="hideAssessmentDetails()">← Back to assessments</button>
        <div class="card p-4">
            <h3 class="fw-bold mb-2">${assessment.name}</h3>
            <p class="text-muted mb-4">Weight: <strong>${assessment.weight}%</strong> | Due: <strong>${new Date(assessment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
            
            <div class="row">
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">📚 Chapters Covered</h5>
                    <ul class="list-group list-group-flush">
                        ${chaptersHtml}
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">📋 Instructions</h5>
                    <p class="text-muted">${assessment.instructions}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('course-assessments-section').classList.add('d-none');
    detailsSection.classList.remove('d-none');
}

function hideAssessmentDetails() {
    document.getElementById('assessment-details-section').classList.add('d-none');
    document.getElementById('course-assessments-section').classList.remove('d-none');
}

// Navigation Logic
function showCourse(name) {
    gridSection.classList.add('d-none');
    detailSection.classList.remove('d-none');
    document.getElementById('selected-course-title').innerText = name;
    renderAssessments(name);
}

document.getElementById('back-to-list').addEventListener('click', () => {
    detailSection.classList.add('d-none');
    gridSection.classList.remove('d-none');
    document.getElementById('assessment-details-section').classList.add('d-none');
    document.getElementById('course-assessments-section').classList.remove('d-none');
});

// Search Logic
document.getElementById('courseSearch').addEventListener('input', (e) => {
    renderCourses('all', e.target.value);
});

// Filter Buttons Logic
document.getElementById('all-courses-btn').addEventListener('click', () => {
    document.getElementById('all-courses-btn').classList.add('active');
    document.getElementById('my-courses-btn').classList.remove('active');
    renderCourses('all', document.getElementById('courseSearch').value);
});

document.getElementById('my-courses-btn').addEventListener('click', () => {
    document.getElementById('my-courses-btn').classList.add('active');
    document.getElementById('all-courses-btn').classList.remove('active');
    renderCourses('my', document.getElementById('courseSearch').value);
});

// Initial Load
renderCourses();

// Add this at the very bottom of your materials.js

window.addEventListener('DOMContentLoaded', () => {
    // 1. Get the course name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseToOpen = urlParams.get('course');
    const assessmentToShow = urlParams.get('assessment');

    if (courseToOpen) {
        // 2. Use your existing showCourse function to reveal the detail section
        showCourse(courseToOpen);

        // 3. If assessment parameter is present, show assessment details
        if (assessmentToShow !== null) {
            setTimeout(() => {
                showAssessmentDetails(courseToOpen, parseInt(assessmentToShow));
            }, 100); // Small delay to ensure DOM is ready
        }
    }
});