import { BattleshipGame } from "./src/game.js";
import { UIController } from "./src/ui-controller.js";
import { ORIENTATION } from "./src/constants.js";

const uiController = new UIController(document);
const game = new BattleshipGame(uiController);

const yearEl = document.getElementById("current-year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const bridge = {
  clickTarget(index) {
    game.placePlayerShip(Number(index));
  },
  clickCpuBoard(index) {
    game.playerAttack(Number(index));
  },
  selectShip(size) {
    game.selectShip(Number(size));
  },
  turnVertical() {
    game.setOrientation(ORIENTATION.VERTICAL);
  },
  turnHorizontal() {
    game.setOrientation(ORIENTATION.HORIZONTAL);
  },
  clickStartGame() {
    game.startGame();
  },
};

Object.entries(bridge).forEach(([key, handler]) => {
  window[key] = handler;
});

window.battleshipGame = game;
