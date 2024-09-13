const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);

const cors = require("cors");
app.use(cors({origin: "http://localhost:3000/"}))

const io = new Server(httpServer, {cors: "http://localhost:3000/"});

io.on("connection", (socket) => {
    console.log("server connected")
  
    socket.on('startPosition', (arg) => {
      socket.broadcast.emit('startPosition', arg)
    })
  
    socket.on('draw', (arg) => {
      socket.broadcast.emit('draw', arg)
    })
  
    socket.on('changeConfig', (arg) => {
      socket.broadcast.emit('changeConfig', arg)
    })
  });

httpServer.listen(5000);