import "dotenv/config";
import "reflect-metadata";
import { Container } from "typedi";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketController } from "./controllers/socket.controller";
import { configureContainer } from "./config/container";
import env from "./config/env";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./utils/socketEvents";

const httpServer = createServer();
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
  },
});

// Configure the dependency injection container
configureContainer(io);

const socketController = Container.get(SocketController);

io.on("connection", (socket) => {
  socketController.handleConnection(socket);
});

httpServer.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
