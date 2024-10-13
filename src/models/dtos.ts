import { CardSetId } from "./CardSet";
import { GameType } from "./Game";

export interface JoinGameDto {
  gameId: string;
  playerName: string;
  playerId: string;
}

export interface FetchGameStateDto {
  gameId: string;
  playerId: string;
}

export interface CreateGamePayload {
  cardSetId: CardSetId;
  type: GameType;
}
