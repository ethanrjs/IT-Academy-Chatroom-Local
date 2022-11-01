import { notify } from './Notify.js';

export async function register(username, displayname, password) {
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
export async function login(username, password) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
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
