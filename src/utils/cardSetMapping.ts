import { CardSet, CardSetId } from "../models/CardSet";
import fantasyCardsCustom from "../resources/fantasy_cards_custom.json";

export const cardSetMapping: Record<CardSetId, CardSet> = {
  THRONE_OF_VIRE: {
    id: "THRONE_OF_VIRE",
    name: "Throne of Vire",
    cards: fantasyCardsCustom,
  },
};
