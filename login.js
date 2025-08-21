// Demo credentials
const CORRECT_USERNAME = "A1908";
const CORRECT_PASSWORD = "1408*";

document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        // Open a new tab (change the URL as needed)
        window.open( "index.html");
        document.getElementById('error').textContent = "";
    } else {
        document.getElementById('error').textContent = "Incorrect username or password.";
        document.getElementById('password').value = "";
    }
});