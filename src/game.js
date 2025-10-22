import {
  ORIENTATION,
  SHIP_DEFINITIONS,
  TOTAL_SHIP_CELLS,
} from "./constants.js";
import { Board } from "./board.js";
import { AIController } from "./ai-controller.js";

const SHIPS_TO_PLACE = SHIP_DEFINITIONS.reduce(
  (total, ship) => total + ship.count,
  0
);

export class BattleshipGame {
  constructor(uiController) {
    this.ui = uiController;
    this.initializeState();
  }

  initializeState() {
    this.playerBoard = new Board();
    this.cpuBoard = new Board();
    this.ai = new AIController(this.playerBoard);
    this.shipInventory = SHIP_DEFINITIONS.map((ship) => ({
      ...ship,
      remaining: ship.count,
    }));
    this.orientation = ORIENTATION.HORIZONTAL;
    this.selectedShipLength = 0;
    this.shipsToPlace = SHIPS_TO_PLACE;
    this.playerHits = 0;
    this.cpuHits = 0;
    this.gameStarted = false;
    this.totalShipCells = TOTAL_SHIP_CELLS;

    this.ui.clearMessage();
    this.ui.clearAnnouncement();
    this.ui.clearPlacementPreview();
    this.shipInventory.forEach((ship) => {
      this.ui.updateShipCount(ship.counterId, ship.remaining);
    });
  }

  getShipSpec(length) {
    return this.shipInventory.find((ship) => ship.length === length);
  }

  setOrientation(orientation) {
    this.clearPlacementPreview();
    this.orientation = orientation;
    const orientationLabel =
      orientation === ORIENTATION.VERTICAL ? "Vertical" : "Horizontal";
    this.ui.setMessage(`Orientation set to ${orientationLabel}.`);
  }

  selectShip(length) {
    this.clearPlacementPreview();
    const ship = this.getShipSpec(length);
    if (!ship) {
      this.ui.setMessage("Unknown ship selection.");
      return;
    }
    if (ship.remaining <= 0) {
      this.ui.setMessage(
        `All ${ship.name}s placed. Choose a different ship.`
      );
      return;
    }
    this.selectedShipLength = length;
    this.ui.setMessage(
      `${ship.name} selected. ${ship.remaining} remaining.`
    );
  }

  previewPlayerPlacement(index) {
    if (this.gameStarted) {
      this.clearPlacementPreview();
      return;
    }

    if (!this.selectedShipLength) {
      this.clearPlacementPreview();
      return;
    }

    const ship = this.getShipSpec(this.selectedShipLength);
    if (!ship || ship.remaining <= 0) {
      this.clearPlacementPreview();
      return;
    }

    const preview = this.playerBoard.previewPlacement(
      this.selectedShipLength,
      index,
      this.orientation
    );

    if (!preview.cells.length) {
      this.clearPlacementPreview();
      return;
    }

    this.ui.showPlacementPreview(preview.cells, preview.isValid);
  }

  clearPlacementPreview() {
    this.ui.clearPlacementPreview();
  }

  placePlayerShip(index) {
    if (this.gameStarted) {
      this.ui.setMessage("Cannot place ships after the game has started.");
      return;
    }

    if (!this.selectedShipLength) {
      this.ui.setMessage("Select a ship before placing it on the board.");
      return;
    }

    const ship = this.getShipSpec(this.selectedShipLength);
    if (!ship || ship.remaining <= 0) {
      this.ui.setMessage("No ships of that type remain to be placed.");
      return;
    }

    const result = this.playerBoard.placeShip(
      this.selectedShipLength,
      index,
      this.orientation
    );

    if (!result.success) {
      if (result.reason === "out_of_bounds") {
        this.ui.setMessage("Ship placement is out of bounds.");
      } else if (result.reason === "overlap") {
        this.ui.setMessage("Ship overlaps an existing placement.");
      } else {
        this.ui.setMessage("Unable to place ship at that location.");
      }
      return;
    }

    ship.remaining -= 1;
    this.shipsToPlace -= 1;
    this.ui.updateShipCount(ship.counterId, ship.remaining);
    this.ui.clearPlacementPreview();
    this.ui.renderShip("player", result.cells);
    this.ui.setMessage(
      `${ship.name} placed. ${ship.remaining} remaining.`
    );
    if (ship.remaining === 0) {
      this.selectedShipLength = 0;
    }
  }

  canStartGame() {
    return this.shipsToPlace === 0;
  }

  startGame() {
    if (this.gameStarted) {
      this.ui.setMessage("Game already in progress.");
      return;
    }

    if (!this.canStartGame()) {
      this.ui.setMessage("Place all ships before starting the game.");
      return;
    }

    this.deployCpuFleet();
    this.gameStarted = true;
    this.clearPlacementPreview();
    this.ui.prepareForBattle();
    this.ui.setMessage("Game started. Attack the computer's board!");
  }

  playerAttack(index) {
    if (!this.gameStarted) {
      this.ui.setMessage("Game has not started.");
      return;
    }

    const result = this.cpuBoard.receiveAttack(index);
    if (result.alreadyAttacked) {
      this.ui.setMessage("You already fired at that location.");
      return;
    }

    if (result.hit) {
      this.playerHits += 1;
      this.ui.renderHit("cpu", index);
    } else {
      this.ui.renderMiss("cpu", index);
    }

    if (this.playerHits >= this.totalShipCells || this.cpuBoard.allShipsSunk()) {
      this.gameStarted = false;
      this.ui.showVictory();
      this.ui.setMessage("Congratulations! You sank the fleet.");
      return;
    }

    this.cpuTurn();
  }

  cpuTurn() {
    if (!this.gameStarted) {
      return;
    }

    let target = this.ai.nextAttack();
    if (target === null || target === undefined) {
      return;
    }

    let result = this.playerBoard.receiveAttack(target);
    // Safety: fall back to random selection if the AI picked an already attacked cell.
    while (result.alreadyAttacked) {
      target = this.playerBoard.randomUnattackedIndex();
      if (target === null || target === undefined) {
        return;
      }
      result = this.playerBoard.receiveAttack(target);
    }

    if (result.hit) {
      this.cpuHits += 1;
      this.ui.renderHit("player", target);
    } else {
      this.ui.renderMiss("player", target);
    }

    this.ai.handleAttackResult(target, result);

    if (this.cpuHits >= this.totalShipCells || this.playerBoard.allShipsSunk()) {
      this.gameStarted = false;
      this.ui.showDefeat();
      this.ui.setMessage("The computer sank your fleet. Try again!");
    }
  }

  deployCpuFleet() {
    this.cpuBoard.reset();
    SHIP_DEFINITIONS.forEach((ship) => {
      for (let count = 0; count < ship.count; count++) {
        let placed = false;
        while (!placed) {
          const startIndex = this.randomIndex();
          const orientation =
            Math.random() < 0.5
              ? ORIENTATION.HORIZONTAL
              : ORIENTATION.VERTICAL;
          const result = this.cpuBoard.placeShip(
            ship.length,
            startIndex,
            orientation
          );
          placed = result.success;
        }
      }
    });
    this.ai.reset();
  }

  randomIndex() {
    const totalCells = this.cpuBoard.size * this.cpuBoard.size;
    return Math.floor(Math.random() * totalCells);
  }
}
