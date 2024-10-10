import Game from "../services/Game";
import Player from "../models/Player";
import { GameAction } from "../models/GameAction";
import { Socket } from "socket.io";
import gameManager from "../utils/gameManager";
import { socketsServer } from "../utils/server";
import { RestrictedGameState } from "../models/Game";

export const socketController = (socket: Socket) => {
  console.log("A user connected---", socket.id);

  socket.on("createGame", (callback: (gameId: string) => void) => {
    const gameId = gameManager.createGame("THRONE_OF_VIRE");
    callback(gameId);
  });

  socket.on(
    "joinGame",
    (
      data: { gameId: string; playerName: string },
      callback: (success: boolean, game?: any) => void
    ) => {
      const { gameId, playerName } = data;
      const game = gameManager.getGame(gameId);

      if (game && game.players.length < 4) {
        const player: Player = {
          id: socket.id,
          name: playerName,
          state: "active",
        };
        console.log("player joined---", player);
        const success = gameManager.addPlayer(gameId, player);

        if (success) {
          socket.join(gameId);
          socketsServer.to(gameId).emit("playerJoined", game?.toJSON());
          callback(true, game.toJSON());
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }
    }
  );

  socket.on("playerAction", (gameId: string, action: GameAction) => {
    if (gameId) {
      console.log(`Player ${socket.id} action in game ${gameId}:`, action);

      gameManager.updateGameState(gameId, action);

      const updatedGame = gameManager.getGame(gameId);
      if (updatedGame) {
        socketsServer.to(gameId).emit("gameStateUpdate", updatedGame);
      }
    }
  });

  socket.on(
    "fetchGameState",
    (
      gameId: string,
      playerId: string,
      callback: (game: RestrictedGameState) => void
    ) => {
      const game = gameManager.getGame(gameId);
      if (game) {
        callback(game.toJSONForPlayer(playerId));
      }
    }
  );

  socket.on("disconnect", (gameId: string) => {
    console.log("User disconnected");
    if (gameId) {
      gameManager.removePlayer(gameId, socket.id);
      socketsServer.to(gameId).emit("playerLeft", socket.id);

      const updatedGame = gameManager.getGame(gameId);
      if (updatedGame) {
        socketsServer.to(gameId).emit("gameStateUpdate", updatedGame);
      }
    }
  });
};
