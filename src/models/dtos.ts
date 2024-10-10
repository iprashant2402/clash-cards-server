export interface PlayerDto {
  id: string;
  name: string;
  state: string;
}

export interface GameActionDto {
  // Define properties based on your game rules
  type: string;
  payload: any;
}

export interface JoinGameDto {
  gameId: string;
  playerName: string;
}

export interface FetchGameStateDto {
  gameId: string;
  playerId: string;
}
