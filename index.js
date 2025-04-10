const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const isDev = process.env.NODE_ENV === 'development'
const allowedOrigin = isDev 
  ? 'http://localhost:3000' 
  : 'https://whiteboard-two-gilt.vercel.app';

app.use(cors({
  origin: allowedOrigin
}))

const httpServer = createServer(app);
const io = new Server(httpServer, {
  transports: ['websocket'],
  cors: {
    origin: allowedOrigin
  },
  pingTimeout: 60000,
  connectTimeout: 60000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

let drawUsers = new Set();

io.on("connection", (socket) => {
    console.log("server connected")

    // Add user when they connect
    drawUsers.add(socket.id);
    io.emit('alert', {message: `${drawUsers.size} user${drawUsers.size > 1 ? 's' : ''} connected`});    
  
    socket.on('joinSession', (sessionId) => {
      socket.join(sessionId);
      drawUsers.add(socket.id);
      // Send the update only to the session room
      io.to(sessionId).emit('userJoined', socket.id)
    })

    socket.on('startPosition', (userId) => {
      socket.broadcast.emit('startPosition', userId)
    })
  
    socket.on('draw', ({ start, end, color, size, sessionId }) => {
      socket.broadcast.to(sessionId).emit('draw', { start, end, color, size });
    });

    socket.on('stopDrawing', (userId) => {
      drawUsers.delete(userId);
      socket.broadcast.emit('stopDrawing', userId);
    })
  
    socket.on('changeConfig', ({ sessionId, ...config }) => {
      socket.broadcast.to(sessionId).emit('changeConfig', config);
    })

    socket.on('changeBackground', ({ sessionId, ...info }) => {
      console.log('Changed background color: ', info)
      socket.broadcast.to(sessionId).emit('changeBackground', info)
    })
    
    socket.on('disconnect', () => {
      console.log("User Disconnected!");
      drawUsers.delete(socket.id);
      socket.rooms.forEach(room => {
        io.to(room).emit('userLeft', socket.id);
      })
    });

    // socket.on('styleChange', (info) => {
    //   console.log('Server received style change:', info);
    //   socket.broadcast.emit('styleChange', info);
    // });
  });

httpServer.listen(5000);