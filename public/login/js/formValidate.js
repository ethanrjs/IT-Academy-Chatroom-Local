import { notify } from './Notify.js';
import { register, login } from './register.js';
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

// if user is logged in, redirect to home page
if (sessionStorage.getItem('token')) {
    window.location.href = '/';
}
