import { Card } from "../models/CardSet";
import Game from "../services/Game";
import { GameAction } from "../models/GameAction";
import { IGame } from "../models/Game";

export const gameStateReducer = (currentState: IGame, action: GameAction) => {
  const updatedState = { ...currentState } as IGame;

  switch (action.type) {
    case "PLAY_CARD":
      playCardActionHandler(updatedState, action);
  }

  return updatedState;
};

const playCardActionHandler = (state: IGame, action: GameAction) => {
  const { attributeSelected } = action;
  // Get the selected attribute value for each active player's top card
  const playerTopCards: { [key: string]: Card } = {};
  let maxAttributeValue = -Infinity;
  let winningPlayerId: string | null = null;

  for (const player in state.cards) {
    const playerObj = state.players.find((p) => p.id === player);
    if (
      playerObj &&
      playerObj.state === "active" &&
      state.cards[player].length > 0
    ) {
      const topCard = state.cards[player][0];
      playerTopCards[player] = topCard;
      const attributeValue = topCard.attributes[attributeSelected];
      if (attributeValue > maxAttributeValue) {
        maxAttributeValue = attributeValue;
        winningPlayerId = player;
      }
    }
  }

  if (winningPlayerId) {
    // Move top cards to the bottom of the winning player's deck
    for (const player in playerTopCards) {
      const card = playerTopCards[player];
      state.cards[player] = state.cards[player].slice(1); // Remove top card
      if (player === winningPlayerId) {
        state.cards[player].push(card); // Add to bottom of winner's deck
      } else {
        state.cards[winningPlayerId].push(card); // Add to bottom of winner's deck
      }
    }
  }
};
