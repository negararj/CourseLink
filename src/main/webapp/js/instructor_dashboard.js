document.addEventListener('DOMContentLoaded', () => {
    loadInstructorDashboard();
    loadCourseOptions();
    setupUploadForm();
    setupExamForm();
});

function loadInstructorDashboard() {
    fetch('api/instructor-dashboard')
        .then(response => response.json())
        .then(data => renderDashboard(data))
        .catch(error => {
            console.error('Dashboard Load Error:', error);
            document.getElementById('courses-taught-list').innerHTML = '<p class="text-danger">Could not load dashboard data.</p>';
        });
}

function renderDashboard(data) {
    updateStats(data);
    renderCourses(data.courses || []);
    renderUploads(data.recentUploads || []);
    renderExams(data.upcomingExams || []);
}

function updateStats(data) {
    const statValues = document.querySelectorAll('.feature-card h2');
    if (statValues.length >= 4) {
        statValues[0].innerText = data.totalStudents || 0;
        statValues[1].innerText = data.avgPerformance || '-';
        statValues[2].innerText = data.activeCourses || 0;
        statValues[3].innerText = data.totalUploads || 0;
    }
}

function renderCourses(courses) {
    const coursesList = document.getElementById('courses-taught-list');
    coursesList.innerHTML = '';

    if (!courses.length) {
        coursesList.innerHTML = '<p class="text-muted">No courses available yet.</p>';
        return;
    }

    courses.forEach((course, index) => {
        const code = course.code || `COURSE${course.id || index + 1}`;
        coursesList.innerHTML += `
            <div class="course-entry shadow-sm mb-3">
                <div class="feature-icon ${index % 2 === 0 ? 'one' : 'two'} me-4" style="width:55px; height:55px; font-size:1rem;">
                    CL
                </div>
                <div class="flex-grow-1">
                    <h5 class="fw-bold mb-0">${course.name}</h5>
                    <p class="text-muted small mb-0">${code} | ${course.instructor}</p>
                </div>
                <div class="d-flex gap-2">
                    <a href="InstructorSyllabus.html?course=${encodeURIComponent(code)}" class="btn btn-outline-primary btn-sm rounded-pill px-3">Syllabus</a>
                    <a href="InstructorMaterials.html?course=${encodeURIComponent(code)}" class="btn btn-primary btn-sm rounded-pill px-3">Manage</a>
                </div>
            </div>
        `;
    });
}

function renderUploads(uploads) {
    const uploadsList = document.getElementById('recent-uploads-list');
    uploadsList.innerHTML = '';

    if (!uploads.length) {
        uploadsList.innerHTML = '<p class="text-muted">No recent uploads yet.</p>';
        return;
    }

    uploads.forEach(upload => {
        uploadsList.innerHTML += `
            <div class="course-entry shadow-sm mb-2" style="padding: 1rem 1.5rem;">
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-0">${upload.title}</h6>
                    <p class="text-muted small mb-0">${upload.courseId} | ${formatDate(upload.uploadDate)}</p>
                </div>
                <span class="badge bg-light text-dark border">${upload.category}</span>
            </div>
        `;
    });
}

function loadCourseOptions() {
    const selects = document.querySelectorAll('.instructor-course-select');
    if (!selects.length) {
        return;
    }

    fetch('api/courses')
        .then(response => response.json())
        .then(courses => {
            selects.forEach(select => {
                select.innerHTML = '';

                if (!courses.length) {
                    select.innerHTML = '<option value="">Create a course first</option>';
                    select.disabled = true;
                    return;
                }

                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.code;
                    option.textContent = `${course.name} (${course.code})`;
                    select.appendChild(option);
                });
            });
        })
        .catch(error => {
            console.error('Course Options Error:', error);
            selects.forEach(select => {
                select.innerHTML = '<option value="">Could not load courses</option>';
                select.disabled = true;
            });
        });
}

function renderExams(exams) {
    const examsList = document.getElementById('upcoming-exams-list');
    examsList.innerHTML = '';

    if (!exams.length) {
        examsList.innerHTML = '<p class="text-muted">No upcoming exams or quizzes.</p>';
        return;
    }

    exams.forEach(exam => {
        examsList.innerHTML += `
            <div class="alert-box mb-3" style="border-left: 4px solid var(--cl-primary);">
                <small class="text-primary fw-bold text-uppercase" style="font-size: 0.7rem;">${formatDate(exam.date)} | ${exam.courseId}</small>
                <h6 class="fw-bold mb-1 mt-1">${exam.title}</h6>
                <p class="small text-muted mb-0">${exam.type} | ${exam.weightPercent}% | ${exam.topic || 'No topic set'}</p>
            </div>
        `;
    });
}

function setupUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    if (!uploadForm) {
        return;
    }

    uploadForm.addEventListener('submit', event => {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        fetch('api/upload-material', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.success ? 'Material uploaded successfully.' : 'Material upload failed.');
            if (data.success) {
                closeModal('uploadMaterialModal');
                uploadForm.reset();
                loadInstructorDashboard();
            }
        })
        .catch(error => {
            console.error('Upload Error:', error);
            alert('Could not connect to the upload service.');
        });
    });
}

function setupExamForm() {
    const examForm = document.getElementById('examForm');
    if (!examForm) {
        return;
    }

    examForm.addEventListener('submit', event => {
        event.preventDefault();

        const params = new URLSearchParams(new FormData(examForm));
        params.set('published', document.getElementById('publishToStudents').checked);

        fetch('api/add-exam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
            alert(data.success ? 'Exam scheduled successfully.' : 'Exam could not be saved.');
            if (data.success) {
                closeModal('createExamModal');
                examForm.reset();
                loadInstructorDashboard();
            }
        })
        .catch(error => {
            console.error('Exam Save Error:', error);
            alert('Could not connect to the exam service.');
        });
    });
}

function closeModal(id) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(id));
    if (modal) {
        modal.hide();
    }
}

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
