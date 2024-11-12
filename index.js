const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const isDev = app.settings.env === 'development'
const URL = isDev ? 'http://localhost:3000' : 'https://whiteboard-two-gilt.vercel.app'
app.use(cors({origin: URL}))
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: URL });

let drawUsers = new Set();

io.on("connection", (socket) => {
    console.log("server connected")
  
    socket.on('startPosition', (userID) => {
      drawUsers.add(userID);

      if(drawUsers.size === 2){
        io.emit('alert', {message: 'Two users are drawing at the same time!'});
      }
      socket.broadcast.emit('startPosition', userID)
    })
  
    socket.on('draw', (arg) => {
      socket.broadcast.emit('draw', arg)
    })

    socket.on('stopDrawing', (userID) => {
      drawUsers.delete(userID);

      if(drawUsers.size < 2){
        io.emit('alert', {message: 'No users are drawing at the same time.'});
      }
      socket.broadcast.emit('stopDrawing', userID);
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
      drawUsers.forEach(userID => {
        if(userID === socket.id){
          drawUsers.delete(userID);
        }
      });
    });

    // socket.on('styleChange', (info) => {
    //   console.log('Server received style change:', info);
    //   socket.broadcast.emit('styleChange', info);
    // });
  });

httpServer.listen(5000);