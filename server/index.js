const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {addUser, removeUser, getUserInRoom, getUser} = require('./users');

app.use(cors());
app.use(router);

io.on('connect', socket=>{
    socket.on('join', ({name, room}, callback)=>{
        const {user, err} = addUser({name, room, id: socket.id});

        if(err) return callback(err);
        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `"${user.name}" has joined!` });
        io.to(user.room).emit('roomData', {room: user.room, users: getUserInRoom(user.room) });
        callback();
    });
    
    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name,  text: message});
        
        callback();
    });
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);

        if(!user) return;

        io.to(user.room).emit('message', {user: 'admin', text: `"${user.name}" has left.`});
    })
});


server.listen(5000, ()=>{
    ///
})