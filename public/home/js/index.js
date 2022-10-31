import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';
import ChatMessage from './lib/Chat.js';

// get the socket.io url
const socket = io(`http://192.168.100.109:3000`);

export default socket;

// handle cors
// jwt decode
import jwtdecode from 'https://cdn.skypack.dev/jwt-decode';
import { notify } from '../../login/js/Notify.js';
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
    }
});
document.querySelector('#chatroom-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (
            document.querySelector('#chatroom-input').value.split('```')
                .length %
                2 ===
            1
        ) {
            send();
            document.querySelector('#chatroom-input').value = '';
        } else {
            document.querySelector('#chatroom-input').value += '\n';
        }
    } else if (e.key === 'Tab') {
        if (
            !(
                document.querySelector('#chatroom-input').value.split('```')
                    .length %
                    2 ===
                0
            )
        )
            return;
        e.preventDefault();
        let start = document.querySelector('#chatroom-input').selectionStart;
        let end = document.querySelector('#chatroom-input').selectionEnd;
        document.querySelector('#chatroom-input').value =
            document
                .querySelector('#chatroom-input')
                .value.substring(0, start) +
            '    ' +
            document.querySelector('#chatroom-input').value.substring(end);
        document.querySelector('#chatroom-input').selectionStart =
            document.querySelector('#chatroom-input').selectionEnd = start + 4;

        return false;
    }
});
function send() {
    let message = document.querySelector('#chatroom-input').value;
    if (message.trim() === '') return;
    let username = jwtdecode(token).username;
    socket.emit(
        'chatroom',
        JSON.stringify({
            message: message,
            timestamp: new Date().getTime(),
            user: socket.id,
            sender: username,
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
        sender: username,
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
        if(users[user].role === 'admin') {
            li.innerHTML = users[user] + ' <span class="admin">admin</span>';
        } else {
            li.innerHTML = users[user] + ' <span class="user">user</span>';
        }
        document.querySelector('#onlineusers').appendChild(li);
    }
});

document.querySelector('#saveBio').addEventListener('click', () => {
    let bio = document.querySelector('#bio').value;
    // emit the bio and the user who sent it
    socket.emit('bio', {
        bio: bio,
        user: socket.id,
        username: jwtdecode(token).username
    });
});

// when the page loads set the bio in the textarea
document.addEventListener('DOMContentLoaded', async () => {
    let bio = await fetch(`/bio/${jwtdecode(token).username}`);
    bio = await bio.json();
    document.querySelector('#bio').value = bio.bio;
});

socket.on('banned', () => {
    notify('Disconnected', 'You have been banned.');
});