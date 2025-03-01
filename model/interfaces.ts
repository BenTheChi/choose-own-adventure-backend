// Store state of the current game
export interface GameObject {
  gameState: GameState;
  title: string;
  content: string;
  choices: string[];
  turnNumber: number;
  maxTurns: number;
  users: User[];
  gameHistory: Turn[];
}

// Define interface to track what happens each turn
export interface Turn {
  content: string;
  result: string;
}

// Store info for each user
export interface User {
  name: string;
  isHost: boolean;
  hasVoted: boolean;
}

export enum GameState {
  ENTRANCE,
  LOBBY,
  STORY,
  FINISHED
}