async function login() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const btn = document.querySelector('button');
    btn.disabled = true;
    btn.innerText = 'Logging in...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin.html';
        } else {
            alert(data.error || 'Login gagal');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Gagal menghubungkan ke server');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Login';
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