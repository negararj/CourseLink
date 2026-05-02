document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SYLLABUS ASSESSMENT TABLE LOGIC
    // ==========================================
    const addAssessmentBtn = document.getElementById('add-assessment');
    const assessmentTableBody = document.querySelector('#assessment-table tbody');

    if (addAssessmentBtn && assessmentTableBody) {
        addAssessmentBtn.addEventListener('click', () => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="form-control shadow-none" placeholder="New Item..."></td>
                <td><input type="number" class="form-control text-center shadow-none" placeholder="0"></td>
                <td class="text-end pe-3"><button class="btn btn-sm text-danger remove-row">Remove</button></td>
            `;
            assessmentTableBody.appendChild(tr);
        });

        assessmentTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-row')) {
                e.target.closest('tr').remove();
            }
        });
    }

    // ==========================================
    // 2. EDITABLE & AUTO-SORTING GRADING SCHEME
    // ==========================================
    const addGradeBtn = document.getElementById('add-grade-row');
    const gradingEditor = document.getElementById('grading-scheme-editor');

    function sortGradingScheme() {
        const rows = Array.from(gradingEditor.querySelectorAll('.grade-row'));
        
        rows.sort((a, b) => {
            // We extract the first number found in the percentage input (e.g., "95-100" -> 95)
            const valA = parseInt(a.querySelectorAll('input')[1].value.replace(/[^0-9]/g, '')) || 0;
            const valB = parseInt(b.querySelectorAll('input')[1].value.replace(/[^0-9]/g, '')) || 0;
            return valB - valA; // Sort Descending (Highest Grade at top)
        });

        // Re-append in new order
        rows.forEach(row => gradingEditor.appendChild(row));
    }

    if (addGradeBtn && gradingEditor) {
        addGradeBtn.addEventListener('click', () => {
            const div = document.createElement('div');
            div.className = 'd-flex align-items-center mb-2 grade-row';
            div.innerHTML = `
                <input type="text" class="form-control form-control-sm fw-bold me-2" placeholder="?" style="width: 45px; text-align: center;">
                <input type="text" class="form-control form-control-sm grade-val" placeholder="e.g. 70-75%">
                <button class="btn btn-sm text-danger ms-2 remove-grade-row" title="Remove grade">&times;</button>
            `;
            gradingEditor.appendChild(div);
            
            // Focus the new input
            div.querySelector('input').focus();
        });

        // Remove row or Sort on value change
        gradingEditor.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-grade-row')) {
                e.target.closest('.grade-row').remove();
            }
        });

        // Sort whenever a user finishes typing a percentage
        gradingEditor.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('form-control')) {
                sortGradingScheme();
            }
        });
    }

    // Global Save Action
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.onclick = () => {
            sortGradingScheme(); // Final sort before saving
            alert('Success! Syllabus and sorted Grading Scheme have been published.');
        };
    }

	// ==========================================
    // 3. REAL MATERIALS UPLOAD TO JAVA BACKEND
    // ==========================================
    const uploadForm = document.getElementById('instructorUploadForm');
    const courseSelect = document.getElementById('courseSelect');
    const courseIdInput = uploadForm ? uploadForm.querySelector('input[name="courseId"]') : null;

    function selectedCourseId() {
        return courseSelect ? courseSelect.value : 'CMP120';
    }

    function syncSelectedCourse() {
        if (courseIdInput) {
            courseIdInput.value = selectedCourseId();
        }
    }

    function loadInstructorMaterials() {
        const grid = document.getElementById('materials-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '<p class="text-muted">Loading materials...</p>';

        fetch(`api/upload-material?courseId=${encodeURIComponent(selectedCourseId())}`)
            .then(response => response.json())
            .then(materials => {
                grid.innerHTML = '';

                if (!materials.length) {
                    grid.innerHTML = '<p class="text-muted">No materials uploaded for this course yet.</p>';
                    return;
                }

                materials.forEach(material => {
                    const card = document.createElement('div');
                    card.className = 'col-md-6 col-xl-4';
                    card.innerHTML = `
                        <div class="card h-100 border-0 shadow-sm p-3">
                            <span class="badge bg-light text-dark align-self-start mb-3">${material.category}</span>
                            <h5 class="fw-bold">${material.title}</h5>
                            <p class="small text-muted mb-3">${material.uploadDate ? new Date(material.uploadDate).toLocaleDateString() : ''}</p>
                            <a class="btn btn-sm btn-outline-primary mt-auto" href="${material.filePath}" target="_blank">Open file</a>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Materials Load Error:', error);
                grid.innerHTML = '<p class="text-danger">Could not load materials.</p>';
            });
    }

    if (courseSelect) {
        syncSelectedCourse();
        loadInstructorMaterials();
        courseSelect.addEventListener('change', () => {
            syncSelectedCourse();
            loadInstructorMaterials();
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stops the page from refreshing
            syncSelectedCourse();
            
            // Automatically bundles your text and file for Java
            const formData = new FormData(uploadForm);

            // Send the request to your backend
            fetch('api/upload-material', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Material uploaded successfully to the database!");
                    
                    // Safely close the Bootstrap Modal
                    const modalEl = document.getElementById('uploadMaterialModal');
                    if (modalEl) {
                        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modalInstance.hide();
                    }
                    
                    // BULLETPROOF RESET: Forces the form to clear even if there is an ID conflict
                    try {
                        HTMLFormElement.prototype.reset.call(e.target);
                        syncSelectedCourse();
                        loadInstructorMaterials();
                    } catch (err) {
                        console.warn("Could not reset form dynamically. Reloading to clear state.");
                        window.location.reload(); 
                    }
                } else {
                    alert("Failed to upload material. Check Java console.");
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert("Could not connect to the server. Is Tomcat running?");
            });
        });
    }
});
