import { Service } from "typedi";
import { GameManager } from "../utils/gameManager";
import { PlayerDto, GameActionDto } from "../models/dtos";

@Service()
export class GameService {
  constructor(private readonly gameManager: GameManager) {}

  async createGame(gameType: string): Promise<string> {
    return this.gameManager.createGame(gameType);
  }

  async addPlayer(
    gameId: string,
    player: PlayerDto
  ): Promise<{ success: boolean; game?: any }> {
    const game = this.gameManager.getGame(gameId);
    if (game && game.players.length < 4) {
      const success = this.gameManager.addPlayer(gameId, player);
      if (success) {
        return { success: true, game: game.toJSON() };
      }
    }
    return { success: false };
  }

  async updateGameState(gameId: string, action: GameActionDto): Promise<void> {
    this.gameManager.updateGameState(gameId, action);
  }

  async getGame(gameId: string): Promise<any | null> {
    const game = this.gameManager.getGame(gameId);
    return game ? game.toJSON() : null;
  }

  async getGameForPlayer(
    gameId: string,
    playerId: string
  ): Promise<any | null> {
    const game = this.gameManager.getGame(gameId);
    return game ? game.toJSONForPlayer(playerId) : null;
  }

  async removePlayer(gameId: string, playerId: string): Promise<void> {
    this.gameManager.removePlayer(gameId, playerId);
  }

  async findGameByPlayerId(playerId: string): Promise<string | null> {
    return this.gameManager.findGameByPlayerId(playerId);
  }
}
