import Player from "../models/Player";
import { GameAction } from "../models/GameAction";
import {
  CardsState,
  GameActionResult,
  GameConstuctorParams,
  GameDTO,
  GameState,
  GameType,
  RestrictedGameState,
} from "../models/Game";
import { CardSet } from "../models/CardSet";
import { cardSetMapping } from "../utils/cardSetMapping";
import { gameStateReducer } from "../utils/gameStateReducer";

export default class Game implements GameDTO {
  id: string;
  cardSet: CardSet;
  players: { [playerId: string]: Player };
  cards: CardsState;
  winner?: Player | null;
  type: GameType;
  currentPlayerIndex: number;
  gameState: GameState;
  lastTurnResult?: GameActionResult;
  playerOrder: string[];

  constructor(params: GameConstuctorParams) {
    this.id = params.id;
    this.cardSet = cardSetMapping[params.cardSetId];
    this.players = {};
    this.cards = {}; // Initialize with default state
    this.type = params.type;
    this.currentPlayerIndex = -1;
    this.gameState = "waiting_players";
    this.playerOrder = [];
  }

  get playerCount(): number {
    return Object.keys(this.players).length;
  }

  get activePlayerCount(): number {
    return Object.values(this.players).filter(
      (player) => player.state === "active"
    ).length;
  }

  async addPlayer(
    player: Player
  ): Promise<{ success: boolean; player?: Player }> {
    if (this.players[player.id]) return { success: true, player };
    if (this.playerCount < 4) {
      this.players[player.id] = player;
      this.playerOrder.push(player.id);
      if (this.checkIfGameCanStart()) {
        this.startGame();
      }
      return { success: true, player };
    }

    return { success: false };
  }

  checkIfGameCanStart(): boolean {
    switch (this.type) {
      case GameType.DUAL:
        return this.playerCount === 2;
      case GameType.TRIPLE:
        return this.playerCount === 3;
      case GameType.QUAD:
        return this.playerCount === 4;
    }
  }

  removePlayer(playerId: string): void {
    if (this.players[playerId]) {
      this.players[playerId].state = "abandoned_game";
      this.updatePlayerOrder();
    }
  }

  private updatePlayerOrder(): void {
    this.playerOrder = this.playerOrder.filter(
      (id) => !["lost", "abandoned_game"].includes(this.players[id].state)
    );
  }

  applyAction(action: GameAction): void {
    const updatedState = gameStateReducer(this.toJSON(), action);
    this.fromJSON(updatedState);
  }

  startGame(): void {
    if (this.playerCount < 2) {
      throw new Error("Not enough players to start the game");
    }

    // 1. Shuffle the cards deck
    this.shuffleCards();

    // 2. Distribute cards to players
    this.distributeCards(this.cardSet);

    // 3. Assign first chance to a random player
    this.currentPlayerIndex = Math.floor(Math.random() * this.playerCount);
    this.gameState = "playing";
  }

  private shuffleCards(): void {
    for (let i = this.cardSet.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cardSet.cards[i], this.cardSet.cards[j]] = [
        this.cardSet.cards[j],
        this.cardSet.cards[i],
      ];
    }
  }

  private distributeCards(deck: CardSet): void {
    const playerIds = Object.keys(this.players);
    let currentPlayerIndex = 0;

    this.cards = playerIds.reduce((acc, playerId) => {
      acc[playerId] = [];
      return acc;
    }, {} as CardsState);

    while (deck.cards.length > 0) {
      const card = deck.cards.pop();
      if (card) {
        const currentPlayerId = playerIds[currentPlayerIndex];
        this.cards[currentPlayerId].push(card);
        currentPlayerIndex = (currentPlayerIndex + 1) % this.playerCount;
      }
    }
  }

  playTurn(action: GameAction, callback: () => void): void {
    if (action.type !== "PLAY_CARD") {
      throw new Error("INVALID_ACTION_TYPE");
    }

    const currentPlayerId = Object.keys(this.players)[this.currentPlayerIndex];
    if (action.playerId !== currentPlayerId) {
      throw new Error("INVALID_PLAYER_FOR_CURRENT_TURN");
    }

    this.applyAction(action);

    this.checkForGameEnd();

    // Move to the next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerCount;
    callback();
  }

  checkForGameEnd(): void {
    if (this.activePlayerCount === 1) {
      this.gameState = "ended";
      this.winner = this.players[this.playerOrder[0]];
    }
  }

  fromJSON(json: GameDTO): void {
    this.id = json.id;
    this.cardSet = json.cardSet;
    this.players = json.players;
    this.cards = json.cards;
    this.winner = json.winner;
    this.gameState = json.gameState;
    this.currentPlayerIndex = json.currentPlayerIndex;
    this.playerOrder = json.playerOrder;
    this.lastTurnResult = json.lastTurnResult;
  }

  toJSON(): GameDTO {
    return {
      id: this.id,
      cardSet: this.cardSet,
      players: this.players,
      cards: this.cards,
      winner: this.winner,
      type: this.type,
      gameState: this.gameState,
      currentPlayerIndex: this.currentPlayerIndex,
      playerOrder: this.playerOrder,
      lastTurnResult: this.lastTurnResult,
    };
  }

  toJSONForPlayer(playerId: string): RestrictedGameState {
    // Implement logic to return a player-specific view of the game state
    return {
      id: this.id,
      cardSetId: this.cardSet.id,
      players: this.players,
      cards: this.cards[playerId],
      type: this.type,
      gameState: this.gameState,
      currentPlayerIndex: this.currentPlayerIndex,
    };
  }
}
