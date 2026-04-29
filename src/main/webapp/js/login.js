document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var role = document.querySelector('input[name="role"]:checked').value;
    if (role === 'instructor') {
        window.location.href = 'InstructorDashboard.html';
    } else {
        window.location.href = 'StudentDashboard.html';
    }
});