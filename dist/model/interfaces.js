"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHOICE = exports.GameState = void 0;
var GameState;
(function (GameState) {
    GameState[GameState["ENTRANCE"] = 0] = "ENTRANCE";
    GameState[GameState["LOBBY"] = 1] = "LOBBY";
    GameState[GameState["STORY"] = 2] = "STORY";
    GameState[GameState["FINISHED"] = 3] = "FINISHED";
})(GameState || (exports.GameState = GameState = {}));
var CHOICE;
(function (CHOICE) {
    CHOICE[CHOICE["OPTION_1"] = 0] = "OPTION_1";
    CHOICE[CHOICE["OPTION_2"] = 1] = "OPTION_2";
    CHOICE[CHOICE["OPTION_3"] = 2] = "OPTION_3";
    CHOICE[CHOICE["OPTION_4"] = 3] = "OPTION_4";
})(CHOICE || (exports.CHOICE = CHOICE = {}));
