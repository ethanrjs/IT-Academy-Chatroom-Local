const express = require('express');
const app = express();
const port = 8080;

// import jsonwebtoken and bcrypt
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');

require('dotenv').config();
// use static
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public' + '/home/index.html');
});
app.get('/account', (req, res) => {
    res.sendFile(__dirname + '/public' + '/login/index.html');
});

// use json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const io = require('socket.io')(8081, {
    cors: {
        origin: 'http://192.168.100.1:8080',
        methods: ['GET', 'POST']
    }
});
let userMap = {};

io.on('connection', socket => {
    // emit that a user connected
    socket.on('connect', () => {
        console.log('Connected to server with id ' + socket.id);
        userMap[socket.id] = undefined;
    });
    socket.on('disconnect', () => {
        console.log('Disconnected from server with id ' + socket.id);
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
        console.log('User ' + socket.id + ' is ' + msg.username);
        userMap[socket.id] = msg.username;
        io.emit('users', msg);
        io.emit('onlineUsers', userMap);
    });
});

app.listen(port, () => {
    console.log(`App listening at http://192.168.100.1:${port}`);
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const displayname = req.body.displayname;
    const password = req.body.password;
    if (username === '' || displayname === '' || password === '') {
        res.status(400).send('Please fill in all fields');
        return;
    }
    // check if username exists
    let users = JSON.parse(fs.readFileSync('accounts.json'));

    if (users[username] !== undefined) {
        res.status(400).send('Username already exists');
        return;
    }

    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // create user
    const newUser = {
        username: username,
        displayname: displayname,
        password: hashedPassword
    };

    // add user to users
    users[username] = newUser;
    // write users to file
    fs.writeFileSync('accounts.json', JSON.stringify(users));

    // log the user in too
    const token = jwt.sign(newUser, process.env.TOKEN_SECRET);
    res.status(200).send(JSON.stringify({ token: token }));
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username === '' || password === '') {
        res.status(400).send('Please fill in all fields');
        return;
    }
    // check if username exists
    let users = JSON.parse(fs.readFileSync('accounts.json'));

    if (users[username] === undefined) {
        res.status(400).send('Username does not exist');
        return;
    }

    // check if password is correct
    const hashedPassword = users[username].password;
    if (!bcrypt.compareSync(password, hashedPassword)) {
        res.status(400).send('Incorrect password');
        return;
    }

    // create token
    const token = jwt.sign(
        {
            username: username,
            displayname: users[username].displayname
        },
        process.env.TOKEN_SECRET
    );

    res.status(200).send(JSON.stringify({ token: token }));
});
