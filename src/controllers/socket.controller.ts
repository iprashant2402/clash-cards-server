import { Service } from "typedi";
import { Socket } from "socket.io";
import * as Joi from "joi";
import { GameService } from "../services/GameService";
import { SocketService } from "../services/SocketService";
import {
  PlayerDto,
  GameActionDto,
  JoinGameDto,
  FetchGameStateDto,
} from "../models/dtos";

@Service()
export class SocketController {
  constructor(
    private readonly gameService: GameService,
    private readonly socketService: SocketService
  ) {}

  handleConnection(socket: Socket): void {
    console.log("A user connected---", socket.id);
    this.registerEventHandlers(socket);
  }

  private registerEventHandlers(socket: Socket): void {
    socket.on("createGame", (callback) => this.createGame(callback));
    socket.on("joinGame", (data, callback) =>
      this.joinGame(socket, data, callback)
    );
    socket.on("playerAction", (gameId, action) =>
      this.playerAction(socket, gameId, action)
    );
    socket.on("fetchGameState", (data, callback) =>
      this.fetchGameState(data, callback)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private async createGame(callback: (gameId: string) => void): Promise<void> {
    const gameId = await this.gameService.createGame("THRONE_OF_VIRE");
    callback(gameId);
  }

  private async joinGame(
    socket: Socket,
    data: JoinGameDto,
    callback: (success: boolean, game?: any) => void
  ): Promise<void> {
    const schema = Joi.object({
      gameId: Joi.string().required(),
      playerName: Joi.string().required(),
    });

    const { error, value } = schema.validate(data);
    if (error) {
      callback(false);
      return;
    }

    const { gameId, playerName } = value;
    const player: PlayerDto = {
      id: socket.id,
      name: playerName,
      state: "active",
    };

    const result = await this.gameService.addPlayer(gameId, player);
    if (result.success) {
      await this.socketService.joinRoom(socket, gameId);
      await this.socketService.emitToRoom(gameId, "playerJoined", result.game);
      callback(true, result.game);
    } else {
      callback(false);
    }
  }

  private async playerAction(
    socket: Socket,
    gameId: string,
    action: GameActionDto
  ): Promise<void> {
    const schema = Joi.object({
      gameId: Joi.string().required(),
      action: Joi.object().required(), // Define specific action schema based on your game rules
    });

    const { error } = schema.validate({ gameId, action });
    if (error) {
      return;
    }

    await this.gameService.updateGameState(gameId, action);
    const updatedGame = await this.gameService.getGame(gameId);
    if (updatedGame) {
      await this.socketService.emitToRoom(
        gameId,
        "gameStateUpdate",
        updatedGame
      );
    }
  }

  private async fetchGameState(
    data: FetchGameStateDto,
    callback: (game: any) => void
  ): Promise<void> {
    const schema = Joi.object({
      gameId: Joi.string().required(),
      playerId: Joi.string().required(),
    });

    const { error, value } = schema.validate(data);
    if (error) {
      callback(null);
      return;
    }

    const { gameId, playerId } = value;
    const game = await this.gameService.getGameForPlayer(gameId, playerId);
    if (game) {
      callback(game);
    } else {
      callback(null);
    }
  }

  private async handleDisconnect(socket: Socket): Promise<void> {
    const gameId = await this.gameService.findGameByPlayerId(socket.id);
    if (gameId) {
      await this.gameService.removePlayer(gameId, socket.id);
      await this.socketService.emitToRoom(gameId, "playerLeft", socket.id);
      const updatedGame = await this.gameService.getGame(gameId);
      if (updatedGame) {
        await this.socketService.emitToRoom(
          gameId,
          "gameStateUpdate",
          updatedGame
        );
      }
    }
  }
}
