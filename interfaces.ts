// Store state of the current game
export interface GameObject {
    GameState: string,
    title: string,
    content: string,
    choices: string[],
    turnNumber: number,
    users: User[]
}

// Store info for each user
export interface User {
    name: string,
    isHost: boolean
}