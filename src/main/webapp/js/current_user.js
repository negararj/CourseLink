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
                    return;
                }

                updateAvatars(user);
                updateWelcomeText(user);
            })
            .catch(function (error) {
                console.error('Current User Error:', error);
            });
    });

    function updateAvatars(user) {
        var avatars = document.querySelectorAll('.user-avatar');
        var initials = (user.initials || initialsFrom(user.fullName, user.email)).toUpperCase();

        for (var i = 0; i < avatars.length; i++) {
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
                spans[i].textContent = 'Welcome, ' + firstName;
            }
        }
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
