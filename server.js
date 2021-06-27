const express = require("express");
const path = require("path");
const app = express();
const http = require('http');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const connectDB = require("./connection/db");

//session 
const flash = require('connect-flash');
const session = require('express-session');

//Passport config
require('./config/passport')(passport);

connectDB();

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


// EJs
app.set('view engine', 'ejs');
app.use(expressLayouts);

//bodyParser
app.use(express.urlencoded({
    extended: false
}));

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());   

//Connect - flash used for displaying messages 
// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// servers static html pages
app.use(express.static('public'));
// app.engine('html', require('ejs').renderFile);

app.use('/', require('./routes/api-routes'));

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