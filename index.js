import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { connect } from "./config.js";
import { chatModel } from "./chat.schema.js";

const app = express();
app.use(cors());

// 1. create server using http server
const server = http.createServer(app);

// 2. create a socket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//  3. use socket events
io.on("connection", (socket) => {
  console.log("connection is established");

  socket.on("join", (data) => {
    socket.username = data;
    // send old message to clients
    chatModel
      .find()
      .sort({ timeStamp: 1 })
      .limit(50)
      .then((messages) => {
        socket.emit("load_messages", messages);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  socket.on("new-message", (message) => {
    let userMessage = {
      username: socket.username,
      message: message,
    };

    const newChat = new chatModel({
      username: socket.username,
      message: message,
      timeStamp: new Date().getTime(),
    });
    newChat.save();
    // broadcast new message to all the clients
    socket.broadcast.emit("broadcast_message", userMessage);
  });

  socket.on("disconnect", () => {
    console.log("connection disconnected");
  });
});

server.listen(3000, () => {
  console.log("App is listening on 3000");
  connect();
});
