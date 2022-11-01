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

    // username must be 3-20 chars
    if (username.length < 3 || username.length > 20) {
        notify('Error', 'Username must be between 3 and 20 characters.');
        return;
    }

    // displayname must be 3-40 chars
    if (displayname.length < 3 || displayname.length > 40) {
        notify('Error', 'Displayname must be between 3 and 40 characters.');
        return;
    }

    // password must be 8-100 chars
    if (password.length < 8 || password.length > 100) {
        notify('Error', 'Password must be between 8 and 100 characters.');
        return;
    }

    // username must be alphanumeric and can contain underscores and periods. it cannot start with a number or period
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.]*$/.test(username)) {
        notify('Error', 'Usernames are alphanumeric with _ and .');
        return;
    }

    // displayname must be alphanumeric and can contain underscores and periods. it cannot start with a number or period
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_. ]*$/.test(displayname)) {
        notify('Error', 'Displaynames are alphanumeric with _ and .');
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
