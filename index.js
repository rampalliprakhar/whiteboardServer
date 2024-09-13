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
});

httpServer.listen(5000);