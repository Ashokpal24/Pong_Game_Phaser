const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

let playerCount = 0;
var multiplierArray = [1, -1];
var playerState = {};

io.on("connection", (socket) => {
  console.log(`user connected ID: ${socket.id}`);
  playerCount++;

  if (playerCount > 2) {
    socket.emit("full");
    socket.disconnect(true);
    return;
  }
  console.log("connected player count: ", playerCount);

  if (playerCount === 1) {
    socket.emit("side", { side: "left", socketID: socket.id });
    playerState[socket.id] = { points: 0 };
  } else if (playerCount === 2) {
    socket.emit("side", { side: "right", socketID: socket.id });
    playerState[socket.id] = { points: 0 };
    io.emit("start", {
      mul: multiplierArray[Math.floor(Math.random() * multiplierArray.length)],
    });
  }

  socket.on("paddlePosition", (data) => {
    io.emit("paddlePosition", { ID: socket.id, y: data.y });
  });

  socket.on("disconnect", () => {
    console.log(`user disconnected ID: ${socket.id}`);
    playerCount--;
    console.log("connected player count: ", playerCount);
  });

  socket.on("goal", (data) => {
    playerState[data.ID]["points"] = playerState[data.ID].points + 1;
    console.log(socket.id);
    console.log(playerState);
    io.emit("goal", {
      mul: multiplierArray[Math.floor(Math.random() * multiplierArray.length)],
      ID: socket.id,
      points: playerState[data.ID]["points"],
    });
  });
  socket.on("ballCollision", (data) => {
    io.emit("ballCollision", {
      ...data,
    });
  });

  // socket.on("message", (data) => {
  //   console.log("Message from client:", data);
  // });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
