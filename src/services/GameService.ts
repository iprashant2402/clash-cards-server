import { Service } from "typedi";
import { GameManager } from "../utils/gameManager";
import Player from "../models/Player";
import { GameAction } from "../models/GameAction";
import { CardSetId } from "../models/CardSet";
import {
  GameConstuctorParams,
  GameDTO,
  RestrictedGameState,
} from "../models/Game";
import Game from "./Game";

@Service()
export class GameService {
  constructor(private readonly gameManager: GameManager) {}

  async createGame(params: Omit<GameConstuctorParams, "id">): Promise<string> {
    return this.gameManager.createGame(params);
  }

  async updateGameState(gameId: string, action: GameAction): Promise<void> {
    this.gameManager.updateGameState(gameId, action);
  }

  async getGame(gameId: string): Promise<Game | undefined> {
    const game = this.gameManager.getGame(gameId);
    return game;
  }

  async getGameForPlayer(
    gameId: string,
    playerId: string
  ): Promise<RestrictedGameState | null> {
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
