const express = require("express");
const path = require("path");
const app = express();
const http = require('http');

// It will create instance of the server 
const server = http.createServer(app);
const socketIo = require('socket.io');

const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    leaveUser,
    getRoomUsers
} = require('./utils/users');

const botName = 'chat-room bot';

// socket is attached to the server
const io = socketIo(server);

const PORT = 3000 || process.env.PORT;

// servers static html pages
app.use(express.static('public'));

// trying to make connection with client 
io.on('connection', socket => {

    //Whenever user joins the room
    socket.on('joinRoom', ({
        username,
        room
    }) => {

        // User from the URL
        const user = userJoin(socket.id, username, room);

        // joins user with room
        socket.join(user.room);

        //Welcome current User
        socket.emit('message', formatMessage(botName, 'Welcome to chat-room!!!'));

        //Broadcast when a user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has joined the chat - room`));

        //send users and room info.
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //will run when someone submit the message
    socket.on('chatMessage', (message) => {
        const currentUser = getCurrentUser(socket.id);
        io.to(currentUser.room).emit('message', formatMessage(currentUser.username, message));
    });

    //Runs when client disconnect
    socket.on('disconnect', () => {
        const user = leaveUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat - room`));
            
            //send users and room info.
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(PORT, () => console.log(`server running at ${PORT}`));