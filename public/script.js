document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('profile.html')) {
        checkAuth();
    }

    initTheme();

    setupForms();

    setupProfile();
});

function checkAuth() {
    fetch('/profile', {
        credentials: 'include'
    }).then(response => {
        if (!response.ok) {
            window.location.href = '/';
        }
    }).catch(() => {
        window.location.href = '/';
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    }
}

function setupForms() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.form').forEach(form => {
                form.classList.remove('active');
            });

            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            }).then(response => {
                if (response.ok) {
                    window.location.href = '/profile.html';
                } else {
                    document.getElementById('login-error').textContent = 'Invalid credentials';
                }
            }).catch(error => {
                document.getElementById('login-error').textContent = 'Login failed';
            });
        });
    }

    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function () {
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            }).then(response => {
                if (response.ok) {
                    window.location.href = '/profile.html';
                } else {
                    response.json().then(data => {
                        document.getElementById('register-error').textContent = data.error || 'Registration failed';
                    });
                }
            }).catch(error => {
                document.getElementById('register-error').textContent = 'Registration failed';
            });
        });
    }
}

function setupProfile() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            }).then(() => {
                window.location.href = '/';
            });
        });
    }

    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchData);
        fetchData();
    }
}

function fetchData() {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '<p>Loading data...</p>';

    fetch('/data', {
        credentials: 'include'
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return response.json();
    }).then(data => {
        dataContainer.innerHTML = `
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Random Number:</strong> ${data.randomNumber}</p>
            <p><strong>Time:</strong> ${new Date(data.time).toLocaleString()}</p>
        `;
    }).catch(error => {
        dataContainer.innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    });
}