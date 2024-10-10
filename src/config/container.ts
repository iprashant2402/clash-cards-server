import { Container } from "typedi";
import { GameManager } from "../utils/gameManager";
import { GameService } from "../services/GameService";
import { SocketService } from "../services/SocketService";

export function configureContainer() {
  Container.set(GameManager, new GameManager());
  Container.set(GameService, Container.get(GameService));
  Container.set(SocketService, Container.get(SocketService));
}
