import { Card } from "../models/CardSet";
import { GameAction } from "../models/GameAction";
import { GameActionResult, GameDTO } from "../models/Game";

export const gameStateReducer = (currentState: GameDTO, action: GameAction) => {
  const updatedState = { ...currentState } as GameDTO;

  switch (action.type) {
    case "PLAY_CARD":
      playCardActionHandler(updatedState, action);
  }

  return updatedState;
};

const playCardActionHandler = (state: GameDTO, action: GameAction) => {
  const { attributeSelected } = action;
  // Get the selected attribute value for each active player's top card
  const playerTopCards: { [key: string]: Card } = {};
  let maxAttributeValue = -Infinity;
  let winningPlayerId: string | null = null;

  for (const player in state.cards) {
    const playerObj = state.players[player];
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
    const result: GameActionResult = {
      wonByPlayerId: winningPlayerId,
      cardsCollected: Object.values(playerTopCards),
    };
    // Move top cards to the bottom of the winning player's deck
    for (const player in playerTopCards) {
      const card = playerTopCards[player];
      state.cards[player] = state.cards[player].slice(1); // Remove top card
      if (player === winningPlayerId) {
        state.cards[player].push(card); // Add to bottom of winner's deck
      } else {
        state.cards[winningPlayerId].push(card); // Add to bottom of winner's deck
      }
      // Check if the player's deck is empty and mark them as lost if so
      if (state.cards[player].length === 0) {
        state.players[player].state = "lost";
        state.playerOrder = state.playerOrder.filter((id) => id !== player);
      }
    }
    state.lastTurnResult = result;
  }
};
