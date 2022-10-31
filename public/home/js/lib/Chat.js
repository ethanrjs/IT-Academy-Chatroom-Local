class ChatMessage {
    static chatBox = document.querySelector('.chat');
    static administrators = ['jacob.geiger', 'ethan.rettinger'];
    static send(message = {}) {
        /*
        message = {
            type: 'user-message',
            user: 'username',
            message: 'message text',
            timestamp: 1234567890,
            fromClient: false
        }
        */
        if (this.administrators.includes(message.sender)) {
            message.role = 'admin';
        }
        if (message.type === undefined) {
            throw new Error('message.type is required');
        }
        if (message.sender === undefined) {
            throw new Error('message.user is required');
        }
        if (message.message === undefined) {
            throw new Error('message.message is required');
        }
        if (message.timestamp === undefined) {
            throw new Error('message.timestamp is required');
        }
        if (message.fromClient === undefined) {
            throw new Error('message.fromClient is required');
        }
        if (message.role) {
            var role = message.role.toLowerCase() || 'user';
        }
        if (message.pfp) {
            var pfp = `/profilePicture/${
                message.sender
            }?${new Date().getTime()}`;
        }

        // get HH:MM for timestamp
        let formattedTime = new Date(message.timestamp).toLocaleTimeString(
            'en-US',
            {
                hour: 'numeric',
                minute: 'numeric'
            }
        );
        if (message.role === 'admin') {
            // admin commands
            if (message.message.trim().toLowerCase() === '!clear') {
                location.reload();
                return;
            }
        }
        // disable html tags
        message.message = message.message
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        // replace newlines with <br>
        message.message = message.message.replace(/\n/g, '<br>');

        // max message length = 4000
        if (message.message.length > 4000) {
            message.message = message.message.substring(0, 4000);
        }
        message.message = message.message.replace(
            /\*\*([^*]+)\*\*/g,
            '<b>$1</b>'
        );
        message.message = message.message.replace(/\*([^*]+)\*/g, '<i>$1</i>');
        // wrap `text` in <code> tags
        message.message = message.message.replace(
            /```([^`]+)```/g,
            '<pre>$1</pre>'
        );
        message.message = message.message.replace(
            /`([^`]+)`/g,
            '<code>$1</code>'
        );
        // if the message contains a link, try to put it in an img
        // if there is an error just ignore it

        // if the message contains a link, try to put it in an img
        message.message = message.message.replace(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
            function (url) {
                try {
                    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                        return `<img src="${url}" />`;
                    } else if (url.match(/\.(mp4|webm)$/) != null) {
                        return `<video src="${url}" controls></video>`;
                    } else {
                        return `<a href="${url}" target="_blank">${url}</a>`;
                    }
                } catch (e) {
                    return `<a href="${url}" target="_blank">${url}</a>`;
                }
            }
        );

        try {
            let lastMessage = this.chatBox.lastElementChild;
            let lastMessageUser =
                lastMessage.querySelector('.message-sender p').innerHTML;
            let lastMessageText = lastMessage.querySelector('.message-text');
            if (lastMessageUser === message.username) {
                lastMessageText.innerHTML += `<p>${message.message}</p>`;
                this.chatBox.scrollTop = this.chatBox.scrollHeight;
                return;
            }
        } catch (err) {
            console.log(err);
        }

        // wrap **text** in <b> tags
        // wrap *text* in <i> tags

        // replace links with <a> tags

        if (message.fromClient) {
            this.chatBox.innerHTML += `
                <div class="message fromMe">
                    <div class="message-sender" data-username="${message.sender}" onclick="viewProfile('${message.sender}')">
                        <img class="logo"
                            src="${pfp}">
                        <p>${message.username}</p>
                        <div class="label">
                            <span class="${role}">${message.role}</span>
                        </div>
                    </div>
                    <div class="message-text">
                        <p>${message.message}</p>
                    </div>
                    <div class="message-time">
                        <p>${formattedTime}</p>
                    </div>
                </div>`;
        } else {
            this.chatBox.innerHTML += `
                <div class="message">
                    <div class="message-sender">
                        <img class="logo"
                            src="${pfp}">
                        <p>${message.username}</p>
                        <div class="label">
                            <span class="${role}">${message.role}</span>
                        </div>
                    </div>
                    <div class="message-text">
                        <p>${message.message}</p>    
                    </div>
                    <div class="message-time">
                        <p>${formattedTime}</p>
                    </div>
                </div>`;
        }

        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    static sendJoin(username) {
        if (username === undefined) return;
        this.chatBox.innerHTML += `
            <div class="joinMsg">
                <p>${username} has joined the chat.</p>
            </div>`;
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    static sendLeave(username) {
        if (username === undefined) return;
        this.chatBox.innerHTML += `
            <div class="leaveMsg">
                <p>${username} has left the chat.</p>
            </div>`;
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
}

export default ChatMessage;
