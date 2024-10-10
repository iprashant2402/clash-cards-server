import { Card, CardSetId } from "./CardSet";
import Player from "./Player";

export interface CardsState {
  [key: string]: Card[];
}

export interface GameConstuctorParams {
  id: string;
  players: Player[];
  state: any;
  cardSet: CardSetId;
}

export interface IGame {
  id: string;
  cardSet: CardSetId;
  players: Player[];
  cards: CardsState;
  winner?: Player | null;
}

export interface RestrictedGameState extends Omit<IGame, "cards"> {
  cards: Card[];
}
