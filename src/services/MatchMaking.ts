import { Service } from "typedi";
import { GameManager } from "../utils/gameManager";

@Service()
export class MatchMaking {
  constructor(private readonly gameManager: GameManager) {}
}
