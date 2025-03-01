"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGameObject = initializeGameObject;
exports.checkAndReassignHost = checkAndReassignHost;
exports.updateGameObject = updateGameObject;
const interfaces_1 = require("../model/interfaces");
function initializeGameObject() {
    return {
        gameState: interfaces_1.GameState.ENTRANCE,
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
    };
}
function checkAndReassignHost(gameObject) {
    if (gameObject.users.length > 0) {
        gameObject.users[0].isHost = true;
    }
    else {
        gameObject.gameState = interfaces_1.GameState.ENTRANCE;
    }
    return gameObject;
}
function updateGameObject(choiceSelected, gameObject) {
    // Update that specific users's hasVoted to true
    gameObject.users.find((user) => user.name === choiceSelected.user.name).hasVoted = true;
    gameObject.users.find((user) => user.name === choiceSelected.user.name).choice = choiceSelected.choice;
    const haveAllUsersVoted = gameObject.users.every((user) => user.hasVoted);
    return { gameObject, haveAllUsersVoted };
}
