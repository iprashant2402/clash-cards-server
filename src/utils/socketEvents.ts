import {
  CreateGamePayload,
  FetchGameStateDto,
  JoinGameDto,
} from "../models/dtos";
import { GameDTO, RestrictedGameState } from "../models/Game";
import { GameAction } from "../models/GameAction";
import Player from "../models/Player";

export enum SocketEvents {
  // Client to server
  CREATE_GAME = "createGame",
  JOIN_GAME = "joinGame",
  PLAYER_ACTION = "playerAction",
  FETCH_GAME_STATE = "fetchGameState",
  DISCONNECT = "disconnect",
  // Server to client
  GAME_STATE_UPDATED = "gameStateUpdated",
  TURN_OVER = "turnOver",
  GAME_ENDED = "gameEnded",
  GAME_STARTED = "gameStarted",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
}

export interface ServerToClientEvents {
  gameStateUpdated: (game: GameDTO) => void;
  turnOver: (game: GameDTO) => void;
  gameStarted: (game: GameDTO) => void;
  gameEnded: (game: GameDTO) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
}

export interface ClientToServerEvents {
  createGame: (
    data: CreateGamePayload,
    callback: (gameId: string) => void
  ) => void;
  joinGame: (
    data: JoinGameDto,
    callback: (success: boolean, game?: any) => void
  ) => void;
  playerAction: (gameId: string, action: GameAction) => void;
  fetchGameState: (
    data: FetchGameStateDto,
    callback: (game?: RestrictedGameState) => void
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerName: string;
  playerId: string;
}
