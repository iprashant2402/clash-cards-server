import { Service } from "typedi";
import { PlayerDto, GameActionDto } from "../models/dtos";
import Game from "../services/Game";

@Service()
export class GameManager {
  private games: Map<string, Game> = new Map();

  createGame(gameType: string): string {
    const gameId = this.generateGameId();
    this.games.set(gameId, new Game(gameId, gameType));
    return gameId;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  addPlayer(gameId: string, player: PlayerDto): boolean {
    const game = this.games.get(gameId);
    if (game) {
      return game.addPlayer(player);
    }
    return false;
  }

  updateGameState(gameId: string, action: GameActionDto): void {
    const game = this.games.get(gameId);
    if (game) {
      game.applyAction(action);
    }
  }

  removePlayer(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      game.removePlayer(playerId);
      if (game.players.length === 0) {
        this.games.delete(gameId);
      }
    }
  }

  findGameByPlayerId(playerId: string): string | null {
    for (const [gameId, game] of this.games.entries()) {
      if (game.players.some((p: PlayerDto) => p.id === playerId)) {
        return gameId;
      }
    }
    return null;
  }

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
