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

io.on("connection", (socket) => {
  console.log(`user connected ID: ${socket.id}`);
  playerCount++;
  console.log("connected player count: ", playerCount);

  if (playerCount > 2) {
    socket.emit("full");
    socket.disconnect(true);
    return;
  }

  if (playerCount === 1) {
    socket.emit("side", { side: "left", socketID: socket.id });
  } else if (playerCount === 2) {
    socket.emit("side", { side: "right", socketID: socket.id });
    io.emit("start");
  }

  socket.on("disconnect", () => {
    console.log(`user disconnected ID: ${socket.id}`);
    playerCount--;
    console.log("connected player count: ", playerCount);
  });

  // socket.on("message", (data) => {
  //   console.log("Message from client:", data);
  // });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
