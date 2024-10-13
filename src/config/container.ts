import { Container } from "typedi";
import { GameManager } from "../utils/gameManager";
import { GameService } from "../services/GameService";
import { SocketService } from "../services/SocketService";
import { Server } from "socket.io";

export function configureContainer(io: Server) {
  Container.set("sockets-server", io);
  Container.set(GameManager, new GameManager());
  Container.set(GameService, Container.get(GameService));
  Container.set(SocketService, Container.get(SocketService));
}
