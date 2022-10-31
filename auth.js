let userMap = {};
const io = require('./express.js');
const chalk = require('chalk');
io.on('connection', socket => {
    socket.on('disconnect', () => {
        console.log(
            chalk.bgBlueBright.white(' [INFO] ') +
                ' ' +
                chalk.white('User disconnected')
        );
        io.emit('users', {
            username: userMap[socket.id],
            type: 'user-leave',
            user: socket.id
        });
        delete userMap[socket.id];
        io.emit('onlineUsers', userMap);
    });
    socket.on('chatroom', message => {
        if (JSON.parse(message).message.trim() === '') return;
        let msg = JSON.parse(message);
        if (msg.message.length > 4000)
            msg.message = msg.message.substring(0, 4000);
        msg = JSON.stringify(msg);
        io.emit('chatroom', msg);
    });

    socket.on('users', msg => {
        console.log(
            chalk.bgBlueBright.white(' [INFO] ') +
                ' ' +
                `${msg.username} connected.`
        );
        let ip = socket.handshake.address;
        console.log(
            chalk.bgBlueBright.white(' [INFO] ') +
                ' ' +
                chalk.white('User connected from ' + ip)
        );

        const banlist = require('./banlist.json');
        if (banlist.list.includes(ip)) {
            console.log(
                chalk.bgBlueBright.white(' [INFO] ') +
                    ' ' +
                    chalk.white('User banned from ' + ip)
            );
                
            socket.emit('banned', 'You are banned from this chatroom.');
            socket.disconnect();
            return;
        }
        userMap[socket.id] = msg.username;
        io.emit('users', msg);
        io.emit('onlineUsers', userMap);
    });
});

// kick out duplicate users when they connect to the socket
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const socketid = socket.id;
    // socketid:username
    for (let [key, value] of Object.entries(userMap)) {
        // if the username is already in the usermap
        if (value === username) {
            // kick out the old user
            io.to(key).emit('kick');
            // delete the old user from the usermap
            delete userMap[key];
            // break out of the loop
            break;
        }
    }
    // continue with the connection
    next();
});
