import { Card, CardSet, CardSetId } from "./CardSet";
import Player from "./Player";

export interface CardsState {
  [key: string]: Card[];
}

export interface GameConstuctorParams {
  id: string;
  cardSetId: CardSetId;
  type: GameType;
}

export enum GameType {
  DUAL = "DUAL",
  TRIPLE = "TRIPLE",
  QUAD = "QUAD",
}

export type GameState = "waiting_players" | "playing" | "ended";

export interface GameDTO {
  id: string;
  cardSet: CardSet;
  players: { [playerId: string]: Player };
  cards: CardsState;
  winner?: Player | null;
  gameState: GameState;
  currentPlayerIndex: number;
  type: GameType;
  lastTurnResult?: GameActionResult;
  playerOrder: string[];
}

export interface GameActionResult {
  wonByPlayerId: string;
  cardsCollected: Card[];
}

export interface RestrictedGameState
  extends Omit<GameDTO, "cards" | "cardSet" | "playerOrder"> {
  cards: Card[];
  cardSetId: CardSetId;
}
