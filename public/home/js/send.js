import ChatMessage from './lib/Chat.js';
import jwtdecode from 'https://cdn.skypack.dev/jwt-decode';
import { token, socket, displayname } from './index.js';

export function send() {
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
