import { BOARD_SIZE, ORIENTATION } from "./constants.js";
import { Ship } from "./ship.js";

export class Board {
  constructor() {
    this.size = BOARD_SIZE;
    this.reset();
  }

  reset() {
    this.ships = [];
    this.shipLookup = new Map();
    this.occupiedCells = new Set();
    this.attackedCells = new Set();
  }

  indexToCoord(index) {
    const row = Math.floor(index / this.size);
    const col = index % this.size;
    return { row, col };
  }

  coordToIndex(row, col) {
    return row * this.size + col;
  }

  isWithinGrid(row, col) {
    return row >= 0 && col >= 0 && row < this.size && col < this.size;
  }

  isInBounds(length, row, col, orientation) {
    if (orientation === ORIENTATION.HORIZONTAL) {
      return col + length <= this.size;
    }
    return row + length <= this.size;
  }

  createShipCells(length, row, col, orientation) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      const targetRow =
        orientation === ORIENTATION.VERTICAL ? row + i : row;
      const targetCol =
        orientation === ORIENTATION.HORIZONTAL ? col + i : col;
      cells.push(this.coordToIndex(targetRow, targetCol));
    }
    return cells;
  }

  canPlaceShip(length, row, col, orientation) {
    if (!this.isInBounds(length, row, col, orientation)) {
      return false;
    }
    const cells = this.createShipCells(length, row, col, orientation);
    return cells.every((cell) => !this.occupiedCells.has(cell));
  }

  placeShip(length, startIndex, orientation) {
    const { row, col } = this.indexToCoord(startIndex);
    if (!this.isInBounds(length, row, col, orientation)) {
      return { success: false, reason: "out_of_bounds" };
    }
    const cells = this.createShipCells(length, row, col, orientation);
    if (cells.some((cell) => this.occupiedCells.has(cell))) {
      return { success: false, reason: "overlap" };
    }

    const ship = new Ship(length, cells);
    this.ships.push(ship);
    cells.forEach((cell) => {
      this.occupiedCells.add(cell);
      this.shipLookup.set(cell, ship);
    });

    return { success: true, cells, ship };
  }

  hasBeenAttacked(index) {
    return this.attackedCells.has(index);
  }

  receiveAttack(index) {
    if (this.hasBeenAttacked(index)) {
      return { alreadyAttacked: true };
    }

    this.attackedCells.add(index);

    const ship = this.shipLookup.get(index);
    if (ship) {
      ship.recordHit(index);
      return { hit: true, shipSunk: ship.isSunk(), ship };
    }

    return { hit: false };
  }

  randomUnattackedIndex() {
    const available = [];
    const totalCells = this.size * this.size;
    for (let index = 0; index < totalCells; index++) {
      if (!this.attackedCells.has(index)) {
        available.push(index);
      }
    }
    if (!available.length) {
      return null;
    }
    const choice =
      available[Math.floor(Math.random() * available.length)];
    return choice;
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }
}
