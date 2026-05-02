(function () {
    document.addEventListener('DOMContentLoaded', function () {
        fetch('api/current-user', {
            credentials: 'same-origin'
        })
            .then(function (response) {
                if (!response.ok) {
                    return null;
                }
                return response.json();
            })
            .then(function (user) {
                if (!user || !user.authenticated) {
                    showLoggedOutState();
                    return;
                }

                showLoggedInState(user);
            })
            .catch(function (error) {
                console.error('Current User Error:', error);
                showLoggedOutState();
            });
    });

    function showLoggedInState(user) {
        updateAvatars(user);
        updateWelcomeText(user);
        updatePublicNavbar(user);
        addLogoutButtons();
    }

    function showLoggedOutState() {
        var avatars = document.querySelectorAll('.user-avatar');
        for (var i = 0; i < avatars.length; i++) {
            avatars[i].style.display = 'none';
        }

        var welcomeTexts = document.querySelectorAll('nav span');
        for (var j = 0; j < welcomeTexts.length; j++) {
            if (welcomeTexts[j].textContent.indexOf('Welcome,') !== -1) {
                welcomeTexts[j].style.display = 'none';
            }
        }

        addLoginSignupToAvatarBars();
    }

    function updateAvatars(user) {
        var avatars = document.querySelectorAll('.user-avatar');
        var initials = (user.initials || initialsFrom(user.fullName, user.email)).toUpperCase();

        for (var i = 0; i < avatars.length; i++) {
            avatars[i].style.display = '';
            avatars[i].textContent = initials;
            avatars[i].setAttribute('title', user.fullName || user.email || 'Current user');
        }
    }

    function updateWelcomeText(user) {
        var firstName = firstNameFrom(user.fullName, user.email);
        if (!firstName) {
            return;
        }

        var spans = document.querySelectorAll('nav span');
        for (var i = 0; i < spans.length; i++) {
            if (spans[i].textContent.indexOf('Welcome,') !== -1) {
                spans[i].style.display = '';
                spans[i].textContent = 'Welcome, ' + firstName;
            }
        }
    }

    function updatePublicNavbar(user) {
        var navLists = document.querySelectorAll('.navbar-nav');
        for (var i = 0; i < navLists.length; i++) {
            hideAuthLinks(navLists[i]);

            if (!navLists[i].querySelector('.auth-user-menu')) {
                navLists[i].appendChild(createUserMenu(user));
            }
        }
    }

    function hideAuthLinks(container) {
        var links = container.querySelectorAll('a[href="Login.html"], a[href="Signup.html"]');
        for (var i = 0; i < links.length; i++) {
            var item = closestTag(links[i], 'LI');
            if (item) {
                item.style.display = 'none';
            } else {
                links[i].style.display = 'none';
            }
        }
    }

    function createUserMenu(user) {
        var item = document.createElement('li');
        item.className = 'nav-item auth-user-menu d-flex align-items-center gap-2 ms-lg-2 mt-2 mt-lg-0';

        var dashboard = document.createElement('a');
        dashboard.className = 'btn btn-outline-primary btn-sm';
        dashboard.href = user.role === 'instructor' ? 'InstructorDashboard.html' : 'StudentDashboard.html';
        dashboard.textContent = 'Dashboard';

        var avatar = document.createElement('a');
        avatar.className = 'user-avatar text-decoration-none';
        avatar.href = 'Profile.html';
        avatar.textContent = (user.initials || initialsFrom(user.fullName, user.email)).toUpperCase();
        avatar.setAttribute('title', user.fullName || user.email || 'Current user');

        var logout = createLogoutButton();

        item.appendChild(dashboard);
        item.appendChild(avatar);
        item.appendChild(logout);
        return item;
    }

    function addLogoutButtons() {
        var avatars = document.querySelectorAll('.user-avatar');
        for (var i = 0; i < avatars.length; i++) {
            var parent = avatars[i].parentNode;
            if (parent && !parent.querySelector('.logout-button')) {
                parent.appendChild(createLogoutButton());
            }
        }
    }

    function addLoginSignupToAvatarBars() {
        var avatars = document.querySelectorAll('.user-avatar');
        for (var i = 0; i < avatars.length; i++) {
            var parent = avatars[i].parentNode;
            if (parent && !parent.querySelector('.login-link')) {
                parent.appendChild(createSmallLink('Login', 'Login.html', 'btn btn-outline-primary btn-sm login-link'));
                parent.appendChild(createSmallLink('Sign Up', 'Signup.html', 'btn btn-primary btn-sm signup-link ms-2'));
            }
        }
    }

    function createSmallLink(text, href, className) {
        var link = document.createElement('a');
        link.href = href;
        link.className = className;
        link.textContent = text;
        return link;
    }

    function createLogoutButton() {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-danger btn-sm logout-button ms-2';
        button.textContent = 'Logout';
        button.addEventListener('click', logout);
        return button;
    }

    function logout() {
        fetch('api/logout', {
            method: 'POST',
            credentials: 'same-origin'
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                window.location.assign(result.redirect || 'index.html');
            })
            .catch(function () {
                window.location.assign('index.html');
            });
    }

    function closestTag(element, tagName) {
        var current = element;
        while (current && current.tagName !== tagName) {
            current = current.parentNode;
        }
        return current;
    }

    function firstNameFrom(fullName, email) {
        var source = (fullName || email || '').trim();
        if (!source) {
            return '';
        }

        if (source.indexOf('@') !== -1) {
            return source.split('@')[0];
        }

        return source.split(/\s+/)[0];
    }

    function initialsFrom(fullName, email) {
        var source = (fullName || email || 'User').trim();
        var parts = source.split(/\s+/);

        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }

        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
})();
