import { ChoiceSelected, GameObject, GameState } from "../model/interfaces";
export function initializeGameObject(): GameObject {
    return {
        gameState: GameState.ENTRANCE,
        title: "",
        content: "",
        choices: [],
        turnNumber: 0,
        maxTurns: 0,
        users: [],
        gameHistory: [],
        theme: "",
        setting: "",
        currTurn: 0
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

export function updateGameObject(choiceSelected: ChoiceSelected, gameObject: GameObject) {
    // Update that specific users's hasVoted to true
    gameObject.users.find((user) => user.name === choiceSelected.user.name)!.hasVoted = true;
    gameObject.users.find((user) => user.name === choiceSelected.user.name)!.choice = choiceSelected.choice;
    const haveAllUsersVoted: boolean = gameObject.users.every((user) => user.hasVoted);
    return { gameObject, haveAllUsersVoted };
}