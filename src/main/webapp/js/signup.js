document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect data (ready for your future backend)
    const firstName = document.getElementById('firstName').value;
    const email = document.getElementById('email').value;

    console.log("Creating account for:", firstName, email);

    // Simulate successful registration
    // You can also set localStorage.setItem('isLoggedIn', 'true') here later
    
    alert("Account created successfully! Redirecting to your dashboard...");
    window.location.href = 'StudentDashboard.html';
});