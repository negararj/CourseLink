document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    var form = e.target;
    var submitButton = form.querySelector('button[type="submit"]');
    var params = new URLSearchParams();

    params.append('email', document.getElementById('email').value.trim());
    params.append('password', document.getElementById('password').value);
    params.append('role', document.querySelector('input[name="role"]:checked').value);

    setMessage('');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
        var response = await fetch('api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString(),
            credentials: 'same-origin'
        });

        var result = await response.json();
        if (!response.ok || !result.success) {
            setMessage(result.message || 'Login failed. Please try again.');
            return;
        }

        redirectToDashboard(result.redirect);
    } catch (error) {
        setMessage('Could not connect to the server. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
});

function redirectToDashboard(redirect) {
    var allowedRedirects = ['StudentDashboard.html', 'InstructorDashboard.html'];
    if (allowedRedirects.indexOf(redirect) === -1) {
        setMessage('Login succeeded, but the server returned an invalid redirect.');
        return;
    }

    window.location.assign(redirect);
}

function setMessage(message) {
    var form = document.getElementById('loginForm');
    var alert = document.getElementById('loginMessage');

    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'loginMessage';
        alert.className = 'alert alert-danger py-2 small';
        form.prepend(alert);
    }

    alert.textContent = message;
    alert.classList.toggle('d-none', !message);
}
