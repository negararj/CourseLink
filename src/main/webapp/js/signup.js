document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    var form = e.target;
    var submitButton = form.querySelector('button[type="submit"]');
    var params = new URLSearchParams();

    params.append('firstName', document.getElementById('firstName').value.trim());
    params.append('lastName', document.getElementById('lastName').value.trim());
    params.append('email', document.getElementById('email').value.trim());
    params.append('major', document.getElementById('major').value);
    params.append('role', document.querySelector('input[name="role"]:checked').value);
    params.append('password', document.getElementById('password').value);

    setMessage('', false);
    submitButton.disabled = true;
    submitButton.textContent = 'Creating...';

    try {
        var response = await fetch('api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString(),
            credentials: 'same-origin'
        });

        var result = await response.json();
        if (!response.ok || !result.success) {
            setMessage(result.message || 'Could not create your account.', false);
            return;
        }

        redirectToDashboard(result.redirect);
    } catch (error) {
        setMessage('Could not connect to the server. Please try again.', false);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    }
});

function redirectToDashboard(redirect) {
    var allowedRedirects = ['StudentDashboard.html', 'InstructorDashboard.html'];
    if (allowedRedirects.indexOf(redirect) === -1) {
        setMessage('Account created, but the server returned an invalid redirect.', false);
        return;
    }

    window.location.assign(redirect);
}

function setMessage(message, success) {
    var form = document.getElementById('signupForm');
    var alert = document.getElementById('signupMessage');

    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'signupMessage';
        form.prepend(alert);
    }

    alert.className = success ? 'alert alert-success py-2 small' : 'alert alert-danger py-2 small';
    alert.textContent = message;
    alert.classList.toggle('d-none', !message);
}
