import { PlayerDto, GameActionDto } from "../models/dtos";

export default class Game {
  id: string;
  type: string;
  players: PlayerDto[];
  state: any; // Define your game state structure

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
    this.players = [];
    this.state = {}; // Initialize with default state
  }

  addPlayer(player: PlayerDto): boolean {
    if (this.players.length < 4) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  applyAction(action: GameActionDto): void {
    // Implement game logic to apply the action and update the state
  }

  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      players: this.players,
      state: this.state,
    };
  }

  toJSONForPlayer(playerId: string): any {
    // Implement logic to return a player-specific view of the game state
    return this.toJSON(); // For now, return full state
  }
}
