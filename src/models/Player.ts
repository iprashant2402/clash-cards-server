export type PlayerState = "active" | "evicted" | "winner" | "abandoned";

interface Player {
  id: string;
  name: string;
  state: PlayerState;
}

export default Player;
