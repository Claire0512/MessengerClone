import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // New user has connected
  console.log("A user connected");
  // User has disconnected
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
  // User has sent a message
  socket.on("chat_room_updates", () => {
    io.emit("chat_room_updates");
  });
  socket.on("user_list_updates", () => {
    io.emit("user_list_updates");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log("Server runnning on http://localhost:" + port);
});
