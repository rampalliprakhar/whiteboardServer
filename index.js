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
  
    socket.on('startPosition', (userId) => {
      socket.broadcast.emit('startPosition', userId)
    })
  
    socket.on('draw', ({ x, y, userId, color, size }) => {
      socket.broadcast.emit('draw', { x, y, userId, color, size });
    });

    socket.on('stopDrawing', (userId) => {
      drawUsers.delete(userId);

      // Update alert when there are no users drawing
      const remainingUsers = drawUsers.size;
      io.emit('alert', {message: `${remainingUsers} user${remainingUsers !== 1 ? 's' : ''} currently drawing`});
      socket.broadcast.emit('stopDrawing', userId);
    })
  
    socket.on('changeConfig', (arg) => {
      socket.broadcast.emit('changeConfig', arg)
    })

    socket.on('changeBackground', (info) => {
      console.log('Changed background color: ', info)
      socket.broadcast.emit('changeBackground', info)
    })
    
    socket.on('disconnect', () => {
      console.log("User Disconnected!");
      drawUsers.delete(socket.id);
      io.emit('alert', {message: `${drawUsers.size} user${drawUsers.size > 1 ? 's' : ''} connected`});
    });

    // socket.on('styleChange', (info) => {
    //   console.log('Server received style change:', info);
    //   socket.broadcast.emit('styleChange', info);
    // });
  });

httpServer.listen(5000);