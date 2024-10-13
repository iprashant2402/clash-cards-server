export type PlayerState = "active" | "lost" | "winner" | "abandoned_game";

interface Player {
  id: string;
  name: string;
  state: PlayerState;
}

export default Player;
