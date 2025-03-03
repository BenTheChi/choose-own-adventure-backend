const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
import {
  CHOICE,
  ChoiceSelected,
  GameObject,
  GameState,
  Turn,
  User,
} from "./model/interfaces";
import {
  initializeGameObject,
  checkAndReassignHost,
  updateGameObject,
  choice_consensus,
} from "./utils/utils";
import {
  CHAT_MESSAGE_KEY,
  GAME_OBJECT_KEY,
  HOST_READY_KEY,
  USER_ENTER_KEY,
  CHOICE_SELECTED_KEY,
} from "./model/constants";
import { llm } from "./llm";

const app = express();
const server = http.createServer(app);

let connectedUserCount = 0;

// declare GameObject which will continuously track game state to be 
let gameObject: GameObject = initializeGameObject();

// const ORIGIN = "https://choose-own-adventure-frontend.onrender.com";
// const ORIGIN = "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: "*", // For local development
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

  // Increment user count whenever a user connects
  connectedUserCount++;

  // send out game data to all clients
  socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);

  socket.on(CHAT_MESSAGE_KEY, (message: string) => {
    console.log("Received message:", message);
    io.emit(CHAT_MESSAGE_KEY, message); // Broadcast to all clients
  });

  socket.on(USER_ENTER_KEY, (user: User) => {
    console.log("User entered the room");

    gameObject.users.push({
      name: user.name,
      isHost: user.isHost,
      hasVoted: false,
      choice: CHOICE.OPTION_1,
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
  });

  socket.on(CHOICE_SELECTED_KEY, async (choiceSelected: ChoiceSelected) => {
    let haveAllUsersVoted: boolean = false;
    ({ gameObject, haveAllUsersVoted } = updateGameObject(
      choiceSelected,
      gameObject
    ));
    if (haveAllUsersVoted) {
      const choice: number = choice_consensus(gameObject);
      gameObject.gameHistory.push({
        content: gameObject.content,
        choice: gameObject.choices[choice],
      });
      gameObject = await llm(gameObject, gameObject.gameHistory);

      // Move gameState to FINISHED at start of the last turn
      if (gameObject.currTurn >= gameObject.maxTurns) {
        
        // Switch state to FINISHED and broadcast change to clients
        gameObject.gameState = GameState.FINISHED;
        socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);

        // wait 30 seconds
        await new Promise(f => setTimeout(f, 30000)); 

        // Store current users, wipe all other gameObject data, then add users back
        const prevUsers = gameObject.users;
        gameObject = initializeGameObject();
        gameObject.users = prevUsers;
      }
    }
    socket.broadcast.emit(GAME_OBJECT_KEY, gameObject);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected from the chatroom");

    // Decrement user count whenever a user disconnects
    connectedUserCount--;

    // Reset entire game object if all users have disconnected
    if (connectedUserCount <= 0) gameObject = initializeGameObject();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
