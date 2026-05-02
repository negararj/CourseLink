document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    setupPasswordForm();
});

function loadProfile() {
    fetch("api/profile", {
        credentials: "same-origin"
    })
        .then(response => {
            if (!response.ok) {
                return response.json()
                    .catch(() => ({ message: "Could not load profile." }))
                    .then(error => {
                        throw new Error(error.message || "Could not load profile.");
                    });
            }
            return response.json();
        })
        .then(data => {
            renderUser(data.user || {});
            renderCourses(data.courses || []);
        })
        .catch(error => {
            console.error("Profile Load Error:", error);
            renderProfileError(error.message);
        });
}

function renderUser(user) {
    setValue("profileName", user.fullName || "-");
    setValue("profileEmail", user.email || "-");
    setValue("profileMajor", user.major || "Not specified");
    setValue("profileRole", titleCase(user.role || "-"));
}

function renderCourses(courses) {
    const list = document.getElementById("profileCourses");
    list.innerHTML = "";

    if (!courses.length) {
        list.innerHTML = `<li class="list-group-item text-muted">No enrolled courses yet.</li>`;
        return;
    }

    courses.forEach(course => {
        const code = course.courseCode ? `${escapeHtml(course.courseCode)} - ` : "";
        const credits = course.credits || 3;

        list.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold">${code}${escapeHtml(course.name)}</div>
                    <small class="text-muted">${escapeHtml(course.instructor || "No instructor listed")}</small>
                </div>
                <span class="badge bg-primary rounded-pill">${credits} credits</span>
            </li>
        `;
    });
}

function setupPasswordForm() {
    const form = document.getElementById("passwordForm");
    if (!form) {
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        clearPasswordMessage();

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            showPasswordMessage("New password and confirmation do not match.", false);
            return;
        }

        const submitButton = document.getElementById("passwordSubmit");
        submitButton.disabled = true;
        submitButton.textContent = "Updating...";

        fetch("api/profile", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(new FormData(form)).toString()
        })
            .then(response => {
                return response.json()
                    .catch(() => ({ message: "Could not update password." }))
                    .then(data => {
                        if (!response.ok) {
                            throw new Error(data.message || "Could not update password.");
                        }
                        return data;
                    });
            })
            .then(data => {
                form.reset();
                showPasswordMessage(data.message || "Password updated successfully.", true);
            })
            .catch(error => {
                console.error("Password Update Error:", error);
                showPasswordMessage(error.message, false);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Update Password";
            });
    });
}

function renderProfileError(message) {
    setValue("profileName", "-");
    setValue("profileEmail", "-");
    setValue("profileMajor", "-");
    setValue("profileRole", "-");
    document.getElementById("profileCourses").innerHTML = `<li class="list-group-item text-danger">${escapeHtml(message)}</li>`;
}

function showPasswordMessage(message, success) {
    const alert = document.getElementById("passwordMessage");
    alert.className = `alert ${success ? "alert-success" : "alert-danger"}`;
    alert.textContent = message;
}

function clearPasswordMessage() {
    const alert = document.getElementById("passwordMessage");
    alert.className = "alert d-none";
    alert.textContent = "";
}

function setValue(id, value) {
    document.getElementById(id).value = value;
}

function titleCase(value) {
    const text = String(value || "");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
