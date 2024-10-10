export type CardSetId = "THRONE_OF_VIRE";

export type Card = {
  id: string;
  name: string;
  attributes: Record<string, number>;
};

export type CardSet = {
  id: CardSetId;
  name: string;
  cards: Card[];
};
