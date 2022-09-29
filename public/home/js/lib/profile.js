import socket from '../index.js';
import jwtdecode from 'https://cdn.skypack.dev/jwt-decode';

document.querySelector('#profile-options').addEventListener('submit', e => {
    let profilePicture = document.querySelector('#profile-picture').value;
    e.preventDefault();
    // profilePicture is an image (png, jpg, jpeg, gif, etc.)
    if (profilePicture.match(/\.(jpeg|jpg|gif|png)$/) != null) {
        // send profilePicture to server
        // get username from jwt
        let token = sessionStorage.getItem('token');
        let username = jwtdecode(token).username;

        let reader = new FileReader();
        reader.readAsDataURL(
            document.querySelector('#profile-picture').files[0]
        );
        reader.onload = () => {
            socket.emit('profile', {
                token: token,
                username: username,
                profilePicture: reader.result
            });
        };
    } else {
        // profilePicture is not an image
        // TODO
        // send error msg w/ notification api
    }
});

socket.on('profile', data => {
    let profilePicture = data.profilePicture;
    document.querySelectorAll('.logo').forEach(logo => {
        logo.src = profilePicture;
    });
});
