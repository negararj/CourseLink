document.getElementById('signupForm').addEventListener('submit', function(e) {
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

    fetch('api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString(),
            credentials: 'same-origin'
        })
        .then(function(response) {
            return response.json().then(function(result) {
                return {
                    ok: response.ok,
                    result: result
                };
            });
        })
        .then(function(data) {
            if (!data.ok || !data.result.success) {
                setMessage(data.result.message || 'Could not create your account.', false);
                return;
            }

            redirectToDashboard(data.result.redirect);
        })
        .catch(function() {
            setMessage('Could not connect to the server. Please try again.', false);
        })
        .finally(function() {
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        });
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
        form.insertBefore(alert, form.firstChild);
    }

    alert.className = success ? 'alert alert-success py-2 small' : 'alert alert-danger py-2 small';
    alert.textContent = message;
    alert.classList.toggle('d-none', !message);
}
