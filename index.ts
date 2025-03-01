const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
import { CHOICE, ChoiceSelected, GameObject, GameState, Turn, User } from './model/interfaces';
import { initializeGameObject, checkAndReassignHost, updateGameObject } from './utils/utils';
import { CHAT_MESSAGE_KEY, GAME_OBJECT_KEY, HOST_READY_KEY, USER_ENTER_KEY, CHOICE_SELECTED_KEY } from './model/constants';
import { llm } from './llm';

const app = express();
const server = http.createServer(app);

// declare GameObject which will continuously track game state to be 
let gameObject: GameObject = initializeGameObject();

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
app.get("/", (req: any, res: any) => {
  res.send("Choose Your Own Adventure Socket.IO backend is running.");
});

io.on("connection", (socket: any) => {
  console.log("A user connected to the chatroom");
  // send out game data to all clients
  socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);

  socket.on(CHAT_MESSAGE_KEY, (message: string) => {
    console.log("Received message:", message);
    io.emit("chat-message", message); // Broadcast to all clients
  });

  socket.on(USER_ENTER_KEY, (user: User) => {
    console.log("User entered the room");
    gameObject.users.push({
      name: user.name, isHost: user.isHost,
      hasVoted: false,
      choice: CHOICE.OPTION_1
    });
    gameObject = checkAndReassignHost(gameObject);
    socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);
  });

  socket.on(HOST_READY_KEY, async (ready: string) => {
    // This means that the host is ready. The user ready key can only be sent by the host
    if ("true" === ready) {
      gameObject.gameState = GameState.STORY;
      gameObject = await llm(gameObject, gameObject.gameHistory);
      socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);
    }
  })

  socket.on(CHOICE_SELECTED_KEY, (choiceSelected: ChoiceSelected) => {
    let haveAllUsersVoted: boolean = false;
    ({ gameObject, haveAllUsersVoted } = updateGameObject(choiceSelected, gameObject));
    if (haveAllUsersVoted) {
      // TODO implement this
    }
    socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected from the chatroom");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Chatroom server running on port ${PORT}`);
});