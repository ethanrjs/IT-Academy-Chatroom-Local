import { notify } from './Notify.js';
const registerForm = document.getElementById('register');
const loginForm = document.getElementById('login');

// register form validation
registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = registerForm.username.value;
    const displayname = registerForm.displayname.value;
    const password = registerForm.password.value;
    if (username === '' || displayname === '' || password === '') {
        alert('Please fill in all fields');
        return;
    }
    register(username, displayname, password);
});

// login form validation
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    if (username === '' || password === '') {
        alert('Please fill in all fields');
        return;
    }

    login(username, password);
});

async function register(username, displayname, password) {
    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            displayname: displayname,
            password: password
        })
    });

    const data = await response.json();
    if (data.token) {
        sessionStorage.setItem('token', data.token);
        window.location.href = '/';
    } else {
        alert(data.error);
    }
}

async function login(username, password) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    let token;
    try {
        token = await response.json();
    } catch (e) {
        notify('Error', 'Invalid username or password');
        return;
    }
    console.log(token);
    if (token) {
        sessionStorage.setItem('token', token.token);
        window.location.href = '/';
    } else {
        alert(data.error);
    }
}

// if user is logged in, redirect to home page
if (sessionStorage.getItem('token')) {
    window.location.href = '/';
}
