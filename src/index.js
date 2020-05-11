const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {addUser,removeUser,getUser,getUsersInRoom}=require('../src/utils/users')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('connection successfull')
    socket.on('join',(username,room,callback)=>{
        console.log('inside join')
        const{error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Welcome!','Admin'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`,'Admin'))
        callback();
       
    })
    socket.on('sendMessage', (message,username,room, callback) => {
        console.log(message)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(room).emit('message', generateMessage(message,username))
        callback()
    })

    socket.on('sendLocation', (coords,username,room, callback) => {
        io.to(room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat!`,'Admin'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})