import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';
import ChatMessage from './lib/Chat.js';

// get url of website (for socket.io)
const url = window.location.href;
// get the socket.io url
const socket = io(`${url.replace(/\/$/, ':3000')}`);

export default socket;

// handle cors
// jwt decode
import jwtdecode from 'https://cdn.skypack.dev/jwt-decode';
const token = sessionStorage.getItem('token');
let username;
let displayname;
if (token) {
    const decoded = jwtdecode(token);
    username = decoded.username;
    displayname = decoded.displayname;
    if (decoded.exp < Date.now() / 1000) {
        sessionStorage.removeItem('token');
    } else {
    }
}

// on page load, get jwt from session storage
// get the username and ensure the user is logged in
// if not, redirect to /account

window.onload = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/account';
    }
};
socket.on('connect', () => {
    socket.emit('users', {
        username: displayname,
        type: 'user-join',
        user: socket.id
    });
    ChatMessage.sendJoin(displayname);
});

socket.on('disconnect', () => {
    socket.emit('users', {
        username: displayname,
        type: 'user-leave',
        user: socket.id
    });
    ChatMessage.sendLeave(displayname);
});

// when enter key is pressed in input, clear it and run function send();
document.querySelector('#chatroom-input').addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        send();
        document.querySelector('#chatroom-input').value = '';
    }
});

function send() {
    let message = document.querySelector('#chatroom-input').value;
    if (message.trim() === '') return;
    socket.emit(
        'chatroom',
        JSON.stringify({
            message: message,
            timestamp: new Date().getTime(),
            user: socket.id,
            username: displayname,
            role: 'user',
            pfp: 'https://i.imgur.com/0X2X3X4.png',
            fromClient: false,
            type: 'user-message'
        })
    );
    ChatMessage.send({
        message: message,
        timestamp: new Date().getTime(),
        user: socket.id,
        role: 'user',
        username: displayname,
        pfp: 'https://i.imgur.com/0X2X3X4.png',
        fromClient: true,
        type: 'user-message'
    });
}

document.querySelector('#chatroom-send').addEventListener('click', () => {
    send();
    document.querySelector('#chatroom-input').value = '';
});

// when chatroom event is received, add message to chatroom
socket.on('chatroom', message => {
    let msg = JSON.parse(message);
    if (msg.user === socket.id) return;
    ChatMessage.send(msg);
    document.querySelector('.chat').scrollTop =
        document.querySelector('.chat').scrollHeight;
});

socket.on('users', message => {
    if (socket.id === message.user) return;
    if (message.type === 'user-join') {
        ChatMessage.sendJoin(message.username);
    } else if (message.type === 'user-leave') {
        ChatMessage.sendLeave(message.username);
    }
});

socket.on('onlineUsers', users => {
    document.querySelector('#onlineusers').innerHTML = '';
    for (let user in users) {
        if (users[user] === undefined) continue;
        let li = document.createElement('li');
        li.innerHTML = users[user] + ' <span class="user">User</span>';
        document.querySelector('#onlineusers').appendChild(li);
    }
});
