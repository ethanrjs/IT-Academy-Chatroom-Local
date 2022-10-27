const fs = require('fs');
const chalk = require('chalk');

let prefix = chalk.bgYellowBright.black.bold(' SERVER ') + ' ';

console.log(prefix + 'Initializing server...');
console.log(prefix + 'Writing random key to secret file...');

let key = '';
for (let i = 0; i < 64; i++) {
    key += String.fromCharCode(Math.floor(Math.random() * 94 + 33));
}

fs.writeFileSync('.env', "TOKEN_SECRET='" + key + "'");

if (!fs.existsSync('accounts.json')) {
    console.log(prefix + 'Creating accounts file...');
    fs.writeFileSync('accounts.json', '{}');
}
console.log(prefix + 'Starting server...');
require('./server.js');
