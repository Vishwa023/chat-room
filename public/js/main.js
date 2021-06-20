// This will get the form of chat
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersName = document.getElementById('users');

//Get username and room from url
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Add room name to DOM
function outputRoomName(room) {
    roomName.innerHTML = room;
}

//Add users to dom 
function outputUsers(users) {
    usersName.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

//Get Room and users
socket.on('roomUsers', ({
    room,
    users
}) => {
    outputRoomName(room);
    outputUsers(users);
});

//Whenever some user joins the chat-room
socket.emit('joinRoom', {
    username,
    room
});

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

// Message from server
socket.on('message', (message) => {
    outputMessage(message);

    //Scroll down whenever 
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Runs when message will submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get the message text
    let msg = document.getElementById('msg').value;
    console.log(msg);
    socket.emit('chatMessage', msg);

    //clear the input
    document.getElementById('msg').value = '';
});