import { cardSetMapping } from "../utils/cardSetMapping";
import { gameStateReducer } from "../utils/gameStateReducer";
import { Card, CardSet, CardSetId } from "../models/CardSet";
import { GameAction } from "../models/GameAction";
import Player from "../models/Player";
import {
  CardsState,
  GameConstuctorParams,
  IGame,
  RestrictedGameState,
} from "../models/Game";

export const MAX_PLAYERS_ALLOWED_IN_GAME = 4;

class Game implements IGame {
  id: string;
  cardSet: CardSetId;
  players: Player[];
  cards: CardsState;
  winner?: Player | null;

  constructor(params: GameConstuctorParams) {
    this.id = params.id;
    this.players = params.players;
    this.cards = params.state;
    this.cardSet = params.cardSet;
  }

  updateState(action: GameAction): IGame {
    const newState = gameStateReducer(this.toJSON(), action);
    this.id = newState.id;
    this.players = newState.players;
    this.cards = newState.cards;
    this.winner = newState.winner;
    return this.toJSON();
  }

  addPlayer(player: Player): boolean {
    if (this.players.length < MAX_PLAYERS_ALLOWED_IN_GAME) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  removePlayer(playerId: string): void {
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      this.players[playerIndex].state = "evicted";
    }
  }

  leaveGame(playerId: string): void {
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      this.players[playerIndex].state = "abandoned";
    }
  }

  setWinner(player: Player): void {
    this.winner = player;
  }

  get cardSetDeck(): CardSet {
    return cardSetMapping[this.cardSet];
  }

  toJSON(): IGame {
    return {
      id: this.id,
      cardSet: this.cardSet,
      players: this.players.map((player) => ({
        id: player.id,
        name: player.name,
        state: player.state,
      })),
      cards: this.cards,
      winner: this.winner ?? null,
    };
  }

  toJSONForPlayer(playerId: string): RestrictedGameState {
    return {
      id: this.id,
      cardSet: this.cardSet,
      players: this.players.map((player) => ({
        id: player.id,
        name: player.name,
        state: player.state,
      })),
      cards: this.cards[playerId],
      winner: this.winner ?? null,
    };
  }
}

export default Game;
