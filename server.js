const express=require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express(); 
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./utils/message')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')
const botname = 'Chatcord Bot';


// Using static folder
app.use(express.static(path.join(__dirname, 'public')));
const PORT= 3000|| process.env.PORT

// RUn when client connects
io.on('connection',socket=>{

    socket.on('joinroom',({username,room})=>{
        const user = userJoin(socket.id, username,room);
        
        socket.join(user.room);
        //Welcome every user
    socket.emit('message',formatMessage(username,'Welcome to ChatCord')) //Message to the current client

    //Broadcast when a user connects
    socket.broadcast
    .to(user.room)
    .emit('message',formatMessage(username,`${user.username} has joined the chat`)); //Message to every client except the current client

    //Send users and room info
    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    })
    });

    //Listen for chat message
    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);
        console.log
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    //RUns when a client disconnect the chat
    socket.on('disconnect',()=>{
        const user =  userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`))  //Message to every client
        }
    })
});

server.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})


