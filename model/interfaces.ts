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
  theme: string;
  setting: string;
  currTurn: number;
}

// Define interface to track what happens each turn
export interface Turn {
  content: string;
  choice: string;
}

// Store info for each user
export interface User {
  name: string;
  isHost?: boolean;
  hasVoted?: boolean;
  choice?: CHOICE;
}

export enum GameState {
  ENTRANCE,
  LOBBY,
  STORY,
  FINISHED,
}

export enum CHOICE {
  OPTION_1,
  OPTION_2,
  OPTION_3,
  OPTION_4,
}

export interface ChoiceSelected {
  choice: CHOICE;
  user: User;
}
