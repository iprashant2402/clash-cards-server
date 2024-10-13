import { Service } from "typedi";
import { Socket } from "socket.io";
import * as Joi from "joi";
import { GameService } from "../services/GameService";
import { SocketService } from "../services/SocketService";
import {
  JoinGameDto,
  FetchGameStateDto,
  CreateGamePayload,
} from "../models/dtos";
import Player from "../models/Player";
import { GameAction } from "../models/GameAction";
import { RestrictedGameState } from "../models/Game";
import { SocketEvents } from "../utils/socketEvents";

@Service()
export class SocketController {
  constructor(
    private readonly gameService: GameService,
    private readonly socketService: SocketService
  ) {}

  handleConnection(socket: Socket): void {
    console.log("A user connected---", JSON.stringify(socket.data));
    this.registerEventHandlers(socket);
  }

  private registerEventHandlers(socket: Socket): void {
    socket.on(SocketEvents.CREATE_GAME, (data, callback) =>
      this.createGame(data, callback)
    );
    socket.on(SocketEvents.JOIN_GAME, (data, callback) =>
      this.joinGame(socket, data, callback)
    );
    socket.on(SocketEvents.PLAYER_ACTION, (gameId, action) =>
      this.playerAction(socket, gameId, action)
    );
    socket.on(SocketEvents.FETCH_GAME_STATE, (data, callback) =>
      this.fetchGameState(data, callback)
    );
    socket.on(SocketEvents.DISCONNECT, () => this.handleDisconnect(socket));
  }

  private async createGame(
    data: CreateGamePayload,
    callback: (gameId: string) => void
  ): Promise<void> {
    const gameId = await this.gameService.createGame(data);
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
      playerId: Joi.string().required(),
    });

    const { error, value } = schema.validate(data);
    if (error) {
      callback(false);
      return;
    }

    const { gameId, playerName, playerId } = value;
    const player: Player = {
      id: playerId,
      name: playerName,
      state: "active",
    };

    const game = await this.gameService.getGame(gameId);
    const gameStateBeforeAddingPlayer = game?.gameState;
    const result = await game?.addPlayer(player);
    if (result?.success) {
      await this.socketService.joinRoom(socket, gameId);
      await this.socketService.emitToRoom(
        gameId,
        SocketEvents.PLAYER_JOINED,
        result.player
      );
      if (
        game?.gameState === "playing" &&
        gameStateBeforeAddingPlayer !== "playing"
      ) {
        await this.socketService.emitToRoom(
          gameId,
          SocketEvents.GAME_STARTED,
          game.toJSON()
        );
      }
      callback(true, game?.toJSONForPlayer(playerId));
    } else {
      callback(false);
    }
  }

  private async playerAction(
    _: Socket,
    gameId: string,
    action: GameAction
  ): Promise<void> {
    const schema = Joi.object({
      gameId: Joi.string().required(),
      action: Joi.object({
        type: Joi.string().valid("PLAY_CARD").required(),
        playerId: Joi.string().required(),
        cardId: Joi.string().required(),
        attributeSelected: Joi.string().required(),
      }).required(),
    });

    const { error } = schema.validate({ gameId, action });
    if (error) {
      console.error(error);
      return;
    }

    const game = await this.gameService.getGame(gameId);
    game?.playTurn(action, async () => {
      await this.socketService.emitToRoom(
        gameId,
        SocketEvents.TURN_OVER,
        game.toJSON()
      );
    });
  }

  private async fetchGameState(
    data: FetchGameStateDto,
    callback: (game?: RestrictedGameState, error?: string) => void
  ): Promise<void> {
    const schema = Joi.object({
      gameId: Joi.string().required(),
      playerId: Joi.string().required(),
    });

    const { error, value } = schema.validate(data);
    if (error) {
      callback(undefined, error.message);
      return;
    }

    const { gameId, playerId } = value;
    const game = await this.gameService.getGameForPlayer(gameId, playerId);
    if (game) {
      callback(game);
    } else {
      callback(undefined, "GAME_NOT_FOUND");
    }
  }

  //   private async handleRejoin(
  //     socket: Socket,
  //     data: { gameId: string; playerId: string },
  //     callback: (game: any) => void
  //   ): Promise<void> {
  //     const schema = Joi.object({
  //       gameId: Joi.string().required(),
  //       playerId: Joi.string().required(),
  //     });

  //     const { error, value } = schema.validate(data);
  //     if (error) {
  //       callback({ success: false, error: "Invalid input" });
  //       return;
  //     }

  //     const { gameId, playerId } = value;
  //     const game = await this.gameService.getGame(gameId);

  //     if (!game) {
  //       callback({ success: false, error: "Game not found" });
  //       return;
  //     }

  //     const player = game.players[playerId];
  //     if (!player) {
  //       callback({ success: false, error: "Player not found in the game" });
  //       return;
  //     }

  //     if (player.state === "abandoned_game") {
  //       player.state = "active";
  //       await this.socketService.joinRoom(socket, gameId);
  //       const updatedGame = await this.gameService.getGameForPlayer(
  //         gameId,
  //         playerId
  //       );

  //       if (updatedGame) {
  //         callback({ success: true, game: updatedGame });
  //         await this.socketService.emitToRoom(
  //           gameId,
  //           SocketEvents.PLAYER_JOINED,
  //           { playerId, rejoined: true }
  //         );
  //         await this.socketService.emitToRoom(
  //           gameId,
  //           SocketEvents.GAME_STATE_UPDATED,
  //           updatedGame
  //         );
  //       } else {
  //         callback({ success: false, error: "Failed to update game state" });
  //       }
  //     } else {
  //       callback({
  //         success: true,
  //         game: await this.gameService.getGameForPlayer(gameId, playerId),
  //       });
  //     }
  //   }

  private async handleDisconnect(socket: Socket): Promise<void> {
    const playerId = socket.data.playerId;
    const gameId = await this.gameService.findGameByPlayerId(playerId);
    if (gameId) {
      //await this.gameService.removePlayer(gameId, playerId);
      await this.socketService.emitToRoom(
        gameId,
        SocketEvents.PLAYER_LEFT,
        playerId
      );
    }
  }
}
