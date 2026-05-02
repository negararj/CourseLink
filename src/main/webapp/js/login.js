document.getElementById('loginForm').addEventListener('submit', function(e) {
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

    fetch('api/login', {
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
                setMessage(data.result.message || 'Login failed. Please try again.');
                return;
            }

            redirectToDashboard(data.result.redirect);
        })
        .catch(function() {
            setMessage('Could not connect to the server. Please try again.');
        })
        .finally(function() {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        });
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
        form.insertBefore(alert, form.firstChild);
    }

    alert.textContent = message;
    alert.classList.toggle('d-none', !message);
}
