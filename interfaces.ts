// Store state of the current game
export interface GameObject {
    gameState: string,
    title: string,
    content: string,
    choices: string[],
    turnNumber: number,
    maxTurns: number,
    users: User[],
    gameHistory: Turn[]
}

// Define interface to track what happens each turn
export interface Turn {
    prompt: string,
    result: string
}

// Store info for each user
export interface User {
    name: string,
    isHost: boolean
}