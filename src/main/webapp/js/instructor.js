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
    // 3. MATERIALS UPLOAD & MANAGEMENT LOGIC
    // ==========================================
    const materialsGrid = document.getElementById('materials-grid');
    const uploadForm = document.getElementById('instructorUploadForm');

    if (materialsGrid) {
        // Mock data for the materials list
        let materials = [
            { id: 1, title: 'Week 1: Syntax Basics', type: 'Lecture Notes', date: 'Oct 12, 2023' },
            { id: 2, title: '2022 Midterm Exam', type: 'Past Paper', date: 'Oct 15, 2023' }
        ];

        function renderMaterials() {
            materialsGrid.innerHTML = '';
            materials.forEach((item, index) => {
                materialsGrid.innerHTML += `
                    <div class="col-md-6 col-xl-4">
                        <div class="card h-100 p-3 border-0 shadow-sm">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-light text-primary">${item.type}</span>
                                <button class="btn btn-sm text-danger border-0 p-0 delete-material" data-index="${index}">Delete</button>
                            </div>
                            <h6 class="fw-bold mb-1">${item.title}</h6>
                            <p class="text-muted small mb-0">Uploaded: ${item.date}</p>
                        </div>
                    </div>`;
            });

            // Attach actual delete functionality to the rendered buttons
            document.querySelectorAll('.delete-material').forEach(btn => {
                btn.onclick = function() {
                    const idx = this.getAttribute('data-index');
                    materials.splice(idx, 1);
                    renderMaterials();
                };
            });
        }

        // Handle File Upload Form Submission
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const newFile = {
                    id: Date.now(),
                    title: document.getElementById('materialTitle').value,
                    type: document.getElementById('materialType').value,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                };

                materials.unshift(newFile); // Add to the top of the list
                renderMaterials();
                
                // Close the Bootstrap Modal
                const modalEl = document.getElementById('uploadMaterialModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
                
                uploadForm.reset();
            });
        }

        // Initial render on page load
        renderMaterials();
    }
});