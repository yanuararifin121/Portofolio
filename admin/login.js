function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'yanuararifin121@gmail.com' && pass === 'LIONSTARMLBB') {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('Username atau password salah');
    }
}

// Make login function global
window.login = login;

// Also handle Enter key
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});