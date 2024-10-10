import { v4 as uuidv4 } from "uuid";
import Game from "../services/Game";
import Player from "./Player";
import { CardSetId } from "./CardSet";
import { GameAction } from "./GameAction";

class GameManager {
  private games: Map<string, Game> = new Map();

  createGame(cardSet: CardSetId): string {
    const gameId = uuidv4();
    this.games.set(
      gameId,
      new Game({ id: gameId, players: [], state: {}, cardSet })
    );
    return gameId;
  }

  addPlayer(gameId: string, player: Player): boolean {
    const game = this.games.get(gameId);
    return game?.addPlayer(player) ?? false;
  }

  removePlayer(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    game?.removePlayer(playerId);
    if (game?.players.length === 0) {
      this.games.delete(gameId);
    }
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  updateGameState(gameId: string, action: GameAction): void {
    const game = this.games.get(gameId);
    game?.updateState(action);
  }
}

export default GameManager;
