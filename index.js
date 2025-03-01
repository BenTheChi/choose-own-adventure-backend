const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// const ORIGIN = "realurl here";
const ORIGIN = "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: ORIGIN, // For local development
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected to the chatroom");

  socket.on("chat-message", (message) => {
    console.log("Received message:", message);
    io.emit("chat-message", message); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected from the chatroom");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Chatroom server running on port ${PORT}`);
});
