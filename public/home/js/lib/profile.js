import socket from '../index.js'
import jwtdecode from 'https://cdn.skypack.dev/jwt-decode'

document.querySelector('#profile-options').addEventListener('submit', async e => {
    let profilePicture = document.querySelector('#profile-picture').value
    e.preventDefault()
    // profilePicture is an image (png, jpg, jpeg, gif, etc.)
    if (profilePicture.match(/\.(jpeg|jpg|gif|jfif|webp|png)$/)) {
        // send profilePicture to server
        // get username from jwt
        let token = sessionStorage.getItem('token')
        let username = jwtdecode(token).username
        console.log('sending')
        let reader = new FileReader()
        reader.readAsDataURL(document.querySelector('#profile-picture').files[0])
        reader.onload = () => {
            socket.emit('profile', {
                token: token,
                username: username,
                profilePicture: reader.result,
            })
        }
    } else {
        // profilePicture is not an image
        // TODO
        // send error msg w/ notification api
    }
    let token = sessionStorage.getItem('token')
    let username = jwtdecode(token).username
    document.querySelector('#pfpPreview').src = ''
    // sleep 0.1s
    await new Promise(resolve => setTimeout(resolve, 100))

    document.querySelector('#pfpPreview').src = '/profilePicture/' + username + '?' + new Date().getTime()
})

;(function () {
    // get token from session storage
    let token = sessionStorage.getItem('token')
    // get username from token
    let username = jwtdecode(token).username
    let displayname = jwtdecode(token).displayname
    document.querySelector('#pfpPreview').src = '/profilePicture/' + username
    document.querySelector('#namePreview').innerHTML = displayname
})()

async function viewProfile(username) {
    let profile = await fetch(`/bio/${username}`)
    // if there was an error, profile.status will be 404

    profile = await profile.json()
    let profileBlock = document.querySelector('#profile')

    // profileBlock.querySelector('badge');

    profileBlock.querySelector('.pfp').src = `/profilePicture/${username}`
    profileBlock.querySelector('.displayName').textContent = profile.displayName
    profileBlock.querySelector('.username').textContent = '@' + profile.username
    profileBlock.querySelector('.profile-body p').textContent = profile.bio ?? ''

    profileBlock.style.display = 'block'
}

window.viewProfile = viewProfile

document.querySelectorAll('.message-sender').forEach(profile => {
    profile.addEventListener('click', e => {
        viewProfile(e.target.dataset.username)
    })
})

// when anything besides profile is click hide #profile
document.addEventListener('click', e => {
    if (!e.target.closest('#profile')) {
        document.querySelector('#profile').style.display = 'none'
    }
})
