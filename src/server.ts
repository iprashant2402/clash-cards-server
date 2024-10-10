// File: src/server.ts
import { httpServer, expressApp, socketsServer } from "./utils/server";
import express from "express";
import cors from "cors";
import { socketController } from "./websockets/socketServer";

const port = process.env.PORT || 3001;

expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(cors());

socketsServer.on("connection", socketController);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
