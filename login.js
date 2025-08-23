// Demo credentials
const CORRECT_USERNAME = "A1908";
const CORRECT_PASSWORD = "1408*";

document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        // Redirect to the terminal page (now terminal.html)
        window.location.href = "terminal.html";
        document.getElementById('error').textContent = "";
    } else {
        document.getElementById('error').textContent = "Incorrect username or password.";
        document.getElementById('password').value = "";
    }
});