export async function notify(title, message, options) {
    // append <div class='notification'> to #notifications
    // set the message (.notification p)
    // set the title (.notification h1)

    // after 5 seconds add the class .slide-out
    // 0.5 seconds after that remove the element
        document
            .querySelectorAll('.notification')
            .forEach(n => n.classList.add('slide-up'));

    let notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `<h1>${title}</h1><p>${message}</p>`;
    document.querySelector('#notifications').appendChild(notification);

    // select all notifications and add .slide-up
    
    setTimeout(() => {
        notification.classList.add('slide-out');

        
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);

    return notification;
}

