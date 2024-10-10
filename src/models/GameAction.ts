export type GameAction = PlayCardAction;

interface PlayCardAction {
  type: "PLAY_CARD";
  cardId: string;
  playerId: string;
  attributeSelected: string;
}
