import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
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
  updateGameObject,
  choice_consensus,
} from "./utils/utils";
import { llm } from "./llm";

const GAME_OBJECT = "game-object";
const HOST_READY_KEY = "host-ready";

const app = express();
const server = http.createServer(app);

// return {
//   gameState: GameState.ENTRANCE,
//   title: "",
//   content: "",
//   choices: [],
//   turnNumber: 0,
//   maxTurns: 0,
//   users: [],
//   gameHistory: [],
//   theme: "",
//   setting: "",
//   currTurn: 0
// }

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

const userSockets = new Map<string, string>();

io.on("connection", (socket: any) => {
  console.log(`A user connected: ${socket.id}`);

  // send out game data to all clients
  socket.broadcast.emit(GAME_OBJECT, gameObject);

  socket.on("chat-message", (message: string) => {
    console.log("Received message:", message);
    io.emit("chat-message", message); // Broadcast to all clients
  });

  socket.on("user-enter", (user: User) => {
    console.log(user.name + " entered the room");

    userSockets.set(socket.id, user.name);

    // If the user is the first to enter the room, assign them as the host
    if (gameObject.users.length === 0) {
      user.isHost = true;
    }

    gameObject.users.push({
      name: user.name,
      isHost: user.isHost,
    });

    socket.emit(GAME_OBJECT, gameObject);
    // Send to all other users
    socket.broadcast.emit(GAME_OBJECT, gameObject);
  });

  socket.on("host-ready", async (ready: string) => {
    // This means that the host is ready. The user ready key can only be sent by the host
    if ("true" === ready) {
      gameObject.gameState = GameState.STORY;
      gameObject = await llm(gameObject, gameObject.gameHistory);
      socket.broadcast.emit(GAME_OBJECT, gameObject);
    }
  });

  socket.on("choice-selected", async (choiceSelected: ChoiceSelected) => {
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
        socket.broadcast.emit(GAME_OBJECT, gameObject);

        // wait 30 seconds
        await new Promise((f) => setTimeout(f, 30000));

        // Store current users, wipe all other gameObject data, then add users back
        const prevUsers = gameObject.users;
        gameObject = initializeGameObject();
        gameObject.users = prevUsers;
      }
    }
    socket.broadcast.emit(GAME_OBJECT, gameObject);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const userName = userSockets.get(socket.id);

    if (userName) {
      gameObject.users = gameObject.users.filter(
        (user) => user.name !== userName
      );
      userSockets.delete(socket.id);

      // Reassign host here
      if (
        gameObject.users.length > 0 &&
        !gameObject.users.some((user) => user.isHost)
      ) {
        const newHostName = userSockets.values().next().value; // Get first entry
        const newHost = gameObject.users.find(
          (user) => user.name === newHostName
        );
        if (newHost) newHost.isHost = true;
      }

      io.emit(GAME_OBJECT, gameObject);
    }

    // Reset entire game object if all users have disconnected
    if (userSockets.size <= 0) gameObject = initializeGameObject();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Chatroom server running on port ${PORT}`);
});
