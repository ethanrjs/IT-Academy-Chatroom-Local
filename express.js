const express = require('express');
const app = express();
const port = 80;
const chalk = require('chalk');
const favicon = require('serve-favicon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static('public'));
app.get('/', (_req, res) => {
    console.log(chalk.bgBlueBright.white(' [INFO] ') + ' ' + chalk.white('GET REQUEST for /'));
    res.sendFile(__dirname + '/public' + '/home/index.html');
});
app.get('/account', (_req, res) => {
    console.log(chalk.bgBlueBright.white(' [INFO] ') + ' ' + chalk.white('GET REQUEST for /account'));
    res.sendFile(__dirname + '/public' + '/login/index.html');
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const io = require('socket.io')(3000, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

module.exports = io;
app.post('/register', (req, res) => {
    const username = req.body.username;
    const displayname = req.body.displayname;
    const password = req.body.password;
    if (username === '' || displayname === '' || password === '') {
        res.status(400).send('Please fill in all fields');
        return;
    }
    // server side username validation
    if (username.length < 3 || username.length > 20) {
        res.status(400).send('Username must be between 3 and 20 characters.');
        return;
    }

    // server side displayname validation
    if (displayname.length < 3 || displayname.length > 40) {
        res.status(400).send('Displayname must be between 3 and 40 characters.');
        return;
    }

    // server side password validation
    if (password.length < 8 || password.length > 100) {
        res.status(400).send('Password must be between 8 and 100 characters.');
        return;
    }

    // username must be alphanumeric and can contain underscores and periods. it cannot start with a number or period
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.]*$/.test(username)) {
        res.status(400).send('Username can only contain alphanumeric characters, underscores, and periods.');
        return;
    }

    // displayname must be alphanumeric and can contain underscores and periods and spaces. it cannot start with a number or period
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_. ]*$/.test(displayname)) {
        res.status(400).send('Displayname can only contain alphanumeric characters, underscores, periods, and spaces.');
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

app.listen(port, () => {
    console.log(chalk.bgBlueBright.white(' [INFO] ') + ' ' + chalk.white('Server started on port ' + port));
});

// profile socket
io.on('connection', socket => {
    socket.on('profile', async data => {
        // get token from data
        let token = data.token;
        // get username from token
        let username = jwt.decode(token).username;
        // get profile picture from data
        let profilePicture = data.profilePicture;
        // save profile picture to users/username/profilePicture.extension
        let extension = profilePicture.match(/\/(.*)\;/)[1];
        //replace base64 header (jpeg, png, etc.) with empty string
        let base64Data = profilePicture.replace(/^data:image\/(jpeg|jpg|gif|jfif|webp|png);base64,/, '');

        if (!fs.existsSync('users/' + username)) {
            fs.mkdirSync('users/' + username);
        }
        // delete all files in users/username
        fs.readdirSync('users/' + username).forEach(file => {
            fs.unlinkSync('users/' + username + '/' + file);
        });

        // resize image to 128x128
        let resizedImage = await sharp(Buffer.from(base64Data, 'base64')).resize(128, 128).toBuffer();

        // write image to file

        fs.writeFileSync('users/' + username + '/profilePicture.' + extension, resizedImage);

        // send profile picture to client
        socket.emit('profile', {
            user: username,
            profilePicture: '/profilePicture/' + username
        });
    });

    socket.on('bio', data => {
        // get token from data
        let token = data.token;
        // get username from token
        let username = data.username;
        // get bio from data
        let bio = data.bio;
        // save bio to users/username/bio.txt
        if (!fs.existsSync('users/' + username)) {
            fs.mkdirSync('users/' + username);
        }
        fs.writeFileSync('users/' + username + '/bio.txt', bio);
        // send bio to client
        socket.emit('bio', {
            user: username,
            bio: bio
        });
    });
});

app.get('/profilePicture/:username', (req, res) => {
    let username = req.params.username;
    // see if profile picture file exists
    if (!fs.existsSync('users/' + username)) {
        res.sendFile(__dirname + '/public' + '/default.jpg');
        return;
    }
    let files = fs.readdirSync('users/' + username);
    let profilePicture = files.find(file => file.includes('profilePicture'));
    console.log('e');
    if (profilePicture === undefined) {
        // default is ./default.jpg
        res.sendFile(__dirname + '/public/default.jpg');
        return;
    }

    res.sendFile(__dirname + '/users/' + username + '/' + profilePicture);
});

app.get('/bio/:username', (req, res) => {
    let username = req.params.username;
    // see if bio file exists
    if (!fs.existsSync('users/' + username)) {
        fs.mkdirSync('users/' + username);
    }
    let files = fs.readdirSync('users/' + username);
    let bio = files.find(file => file.includes('bio'));
    let displayName = JSON.parse(fs.readFileSync('./accounts.json', 'utf8'))[username].displayname;
    if (bio === undefined) {
        res.json({
            bio: 'This user does not have a bio.',
            username: username,
            displayName: displayName
        });
        return;
    }
    let bioText = fs.readFileSync('users/' + username + '/' + bio, 'utf8');

    res.json({
        bio: bioText,
        username: username,
        displayName: displayName
    });
});
