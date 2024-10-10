import http from "http";
import express from "express";
import { Server } from "socket.io";

const expressApp = express();

const httpServer = http.createServer(expressApp);

const socketsServer = new Server(httpServer, {
  cors: {
    origin: "http://192.168.29.148:3000",
    methods: ["GET", "POST"],
  },
});

export { expressApp, httpServer, socketsServer };
