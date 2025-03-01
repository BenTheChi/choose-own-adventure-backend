"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const interfaces_1 = require("./model/interfaces");
const utils_1 = require("./utils/utils");
const constants_1 = require("./model/constants");
const llm_1 = require("./llm");
const app = express();
const server = http.createServer(app);
// declare GameObject which will continuously track game state to be 
let gameObject = (0, utils_1.initializeGameObject)();
const ORIGIN = "https://choose-own-adventure-frontend.onrender.com";
// const ORIGIN = "http://localhost:5173";
const io = new Server(server, {
    cors: {
        origin: ORIGIN, // For local development
        methods: ["GET", "POST"],
    },
    path: "/socket.io",
});
app.use(cors());
// Route handler for the root path
app.get("/", (req, res) => {
    res.send("Choose Your Own Adventure Socket.IO backend is running.");
});
io.on("connection", (socket) => {
    console.log("A user connected to the chatroom");
    // send out game data to all clients
    socket.broadcast.emit(constants_1.GAME_OBJECT_KEY, gameObject);
    socket.on(constants_1.CHAT_MESSAGE_KEY, (message) => {
        console.log("Received message:", message);
        io.emit("chat-message", message); // Broadcast to all clients
    });
    socket.on(constants_1.USER_ENTER_KEY, (user) => {
        console.log("User entered the room");
        gameObject.users.push({
            name: user.name, isHost: user.isHost,
            hasVoted: false,
            choice: interfaces_1.CHOICE.OPTION_1
        });
        gameObject = (0, utils_1.checkAndReassignHost)(gameObject);
        socket.broadcast.emit(constants_1.GAME_OBJECT_KEY, gameObject);
    });
    socket.on(constants_1.HOST_READY_KEY, async (ready) => {
        // This means that the host is ready. The user ready key can only be sent by the host
        if ("true" === ready) {
            gameObject.gameState = interfaces_1.GameState.STORY;
            gameObject = await (0, llm_1.llm)(gameObject, gameObject.gameHistory);
            socket.broadcast.emit(constants_1.GAME_OBJECT_KEY, gameObject);
        }
    });
    socket.on(constants_1.CHOICE_SELECTED_KEY, (choiceSelected) => {
        let haveAllUsersVoted = false;
        ({ gameObject, haveAllUsersVoted } = (0, utils_1.updateGameObject)(choiceSelected, gameObject));
        if (haveAllUsersVoted) {
            // TODO implement this
        }
        socket.broadcast.emit(constants_1.GAME_OBJECT_KEY, gameObject);
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected from the chatroom");
    });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Chatroom server running on port ${PORT}`);
});
