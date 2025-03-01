import { GameObject, GameState } from "../model/interfaces";
export function initializeGameObject(): GameObject {
    return {
        gameState: GameState.ENTRANCE,
        title: "",
        content: "",
        choices: [],
        turnNumber: 0,
        maxTurns: 0,
        users: [],
        gameHistory: []
    }
}

export function checkAndReassignHost(gameObject: GameObject) {
    if (gameObject.users.length > 0) {
        gameObject.users[0].isHost = true;
    } else {
        gameObject.gameState = GameState.ENTRANCE;
    }
    return gameObject;
}