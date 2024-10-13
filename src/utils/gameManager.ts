import { Service } from "typedi";
import Game from "../services/Game";
import { GameAction } from "../models/GameAction";
import { GameConstuctorParams } from "../models/Game";

@Service()
export class GameManager {
  private games: Map<string, Game> = new Map();

  createGame(params: Omit<GameConstuctorParams, "id">): string {
    const gameId = this.generateGameId();
    this.games.set(gameId, new Game({ ...params, id: gameId }));
    return gameId;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  updateGameState(gameId: string, action: GameAction): void {
    const game = this.games.get(gameId);
    if (game) {
      game.applyAction(action);
    }
  }

  removePlayer(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      game.removePlayer(playerId);
      if (game.playerCount === 0) {
        this.games.delete(gameId);
      }
    }
  }

  findGameByPlayerId(playerId: string): string | null {
    for (const [gameId, game] of this.games.entries()) {
      if (game.players[playerId]) {
        return gameId;
      }
    }
    return null;
  }

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
