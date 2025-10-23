import { Board } from '../board.js';
import { BOARD_SIZE, ORIENTATION } from '../constants.js';
import { Ship } from '../ship.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  describe('constructor and reset', () => {
    test('should initialize with correct size', () => {
      expect(board.size).toBe(BOARD_SIZE);
    });

    test('should initialize empty collections', () => {
      expect(board.ships).toEqual([]);
      expect(board.shipLookup.size).toBe(0);
      expect(board.occupiedCells.size).toBe(0);
      expect(board.attackedCells.size).toBe(0);
    });

    test('should reset board state', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      board.receiveAttack(0);
      
      expect(board.ships.length).toBeGreaterThan(0);
      expect(board.attackedCells.size).toBeGreaterThan(0);
      
      board.reset();
      
      expect(board.ships).toEqual([]);
      expect(board.shipLookup.size).toBe(0);
      expect(board.occupiedCells.size).toBe(0);
      expect(board.attackedCells.size).toBe(0);
    });

    test('should maintain size after reset', () => {
      const originalSize = board.size;
      board.reset();
      expect(board.size).toBe(originalSize);
    });
  });

  describe('indexToCoord', () => {
    test('should convert index 0 to row 0, col 0', () => {
      expect(board.indexToCoord(0)).toEqual({ row: 0, col: 0 });
    });

    test('should convert index 9 to row 0, col 9', () => {
      expect(board.indexToCoord(9)).toEqual({ row: 0, col: 9 });
    });

    test('should convert index 10 to row 1, col 0', () => {
      expect(board.indexToCoord(10)).toEqual({ row: 1, col: 0 });
    });

    test('should convert index 99 to row 9, col 9', () => {
      expect(board.indexToCoord(99)).toEqual({ row: 9, col: 9 });
    });

    test('should handle middle indices correctly', () => {
      expect(board.indexToCoord(45)).toEqual({ row: 4, col: 5 });
      expect(board.indexToCoord(55)).toEqual({ row: 5, col: 5 });
    });

    test('should handle negative indices', () => {
      expect(board.indexToCoord(-1)).toEqual({ row: -1, col: -1 });
    });
  });

  describe('coordToIndex', () => {
    test('should convert row 0, col 0 to index 0', () => {
      expect(board.coordToIndex(0, 0)).toBe(0);
    });

    test('should convert row 0, col 9 to index 9', () => {
      expect(board.coordToIndex(0, 9)).toBe(9);
    });

    test('should convert row 1, col 0 to index 10', () => {
      expect(board.coordToIndex(1, 0)).toBe(10);
    });

    test('should convert row 9, col 9 to index 99', () => {
      expect(board.coordToIndex(9, 9)).toBe(99);
    });

    test('should handle middle coordinates correctly', () => {
      expect(board.coordToIndex(4, 5)).toBe(45);
      expect(board.coordToIndex(5, 5)).toBe(55);
    });

    test('should be inverse of indexToCoord', () => {
      for (let i = 0; i < 100; i++) {
        const coord = board.indexToCoord(i);
        expect(board.coordToIndex(coord.row, coord.col)).toBe(i);
      }
    });
  });

  describe('isWithinGrid', () => {
    test('should return true for valid coordinates', () => {
      expect(board.isWithinGrid(0, 0)).toBe(true);
      expect(board.isWithinGrid(9, 9)).toBe(true);
      expect(board.isWithinGrid(5, 5)).toBe(true);
    });

    test('should return false for negative coordinates', () => {
      expect(board.isWithinGrid(-1, 0)).toBe(false);
      expect(board.isWithinGrid(0, -1)).toBe(false);
      expect(board.isWithinGrid(-1, -1)).toBe(false);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(board.isWithinGrid(10, 0)).toBe(false);
      expect(board.isWithinGrid(0, 10)).toBe(false);
      expect(board.isWithinGrid(10, 10)).toBe(false);
    });

    test('should return false for coordinates exceeding grid', () => {
      expect(board.isWithinGrid(100, 100)).toBe(false);
      expect(board.isWithinGrid(0, 100)).toBe(false);
    });

    test('should handle boundary conditions', () => {
      expect(board.isWithinGrid(0, 0)).toBe(true);
      expect(board.isWithinGrid(9, 9)).toBe(true);
      expect(board.isWithinGrid(10, 0)).toBe(false);
      expect(board.isWithinGrid(0, 10)).toBe(false);
    });
  });

  describe('isInBounds', () => {
    test('should return true for horizontal ship within bounds', () => {
      expect(board.isInBounds(3, 0, 0, ORIENTATION.HORIZONTAL)).toBe(true);
      expect(board.isInBounds(5, 0, 0, ORIENTATION.HORIZONTAL)).toBe(true);
      expect(board.isInBounds(3, 0, 7, ORIENTATION.HORIZONTAL)).toBe(true);
    });

    test('should return false for horizontal ship out of bounds', () => {
      expect(board.isInBounds(3, 0, 8, ORIENTATION.HORIZONTAL)).toBe(false);
      expect(board.isInBounds(5, 0, 6, ORIENTATION.HORIZONTAL)).toBe(false);
      expect(board.isInBounds(11, 0, 0, ORIENTATION.HORIZONTAL)).toBe(false);
    });

    test('should return true for vertical ship within bounds', () => {
      expect(board.isInBounds(3, 0, 0, ORIENTATION.VERTICAL)).toBe(true);
      expect(board.isInBounds(5, 0, 0, ORIENTATION.VERTICAL)).toBe(true);
      expect(board.isInBounds(3, 7, 0, ORIENTATION.VERTICAL)).toBe(true);
    });

    test('should return false for vertical ship out of bounds', () => {
      expect(board.isInBounds(3, 8, 0, ORIENTATION.VERTICAL)).toBe(false);
      expect(board.isInBounds(5, 6, 0, ORIENTATION.VERTICAL)).toBe(false);
      expect(board.isInBounds(11, 0, 0, ORIENTATION.VERTICAL)).toBe(false);
    });

    test('should handle edge cases at boundary', () => {
      expect(board.isInBounds(1, 9, 9, ORIENTATION.HORIZONTAL)).toBe(true);
      expect(board.isInBounds(1, 9, 9, ORIENTATION.VERTICAL)).toBe(true);
      expect(board.isInBounds(2, 9, 9, ORIENTATION.HORIZONTAL)).toBe(false);
      expect(board.isInBounds(2, 9, 9, ORIENTATION.VERTICAL)).toBe(false);
    });
  });

  describe('createShipCells', () => {
    test('should create horizontal ship cells', () => {
      const cells = board.createShipCells(3, 0, 0, ORIENTATION.HORIZONTAL);
      expect(cells).toEqual([0, 1, 2]);
    });

    test('should create vertical ship cells', () => {
      const cells = board.createShipCells(3, 0, 0, ORIENTATION.VERTICAL);
      expect(cells).toEqual([0, 10, 20]);
    });

    test('should create cells for ship at different position', () => {
      const cells = board.createShipCells(4, 2, 3, ORIENTATION.HORIZONTAL);
      expect(cells).toEqual([23, 24, 25, 26]);
    });

    test('should create cells for vertical ship at different position', () => {
      const cells = board.createShipCells(4, 2, 3, ORIENTATION.VERTICAL);
      expect(cells).toEqual([23, 33, 43, 53]);
    });

    test('should handle single cell ship', () => {
      const cellsH = board.createShipCells(1, 5, 5, ORIENTATION.HORIZONTAL);
      const cellsV = board.createShipCells(1, 5, 5, ORIENTATION.VERTICAL);
      expect(cellsH).toEqual([55]);
      expect(cellsV).toEqual([55]);
    });

    test('should create cells for maximum length ship', () => {
      const cells = board.createShipCells(10, 0, 0, ORIENTATION.HORIZONTAL);
      expect(cells).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('canPlaceShip', () => {
    test('should return true for valid placement on empty board', () => {
      expect(board.canPlaceShip(3, 0, 0, ORIENTATION.HORIZONTAL)).toBe(true);
      expect(board.canPlaceShip(5, 0, 0, ORIENTATION.VERTICAL)).toBe(true);
    });

    test('should return false when out of bounds', () => {
      expect(board.canPlaceShip(3, 0, 8, ORIENTATION.HORIZONTAL)).toBe(false);
      expect(board.canPlaceShip(5, 6, 0, ORIENTATION.VERTICAL)).toBe(false);
    });

    test('should return false when overlapping existing ship', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      expect(board.canPlaceShip(3, 0, 0, ORIENTATION.VERTICAL)).toBe(false);
      expect(board.canPlaceShip(3, 0, 1, ORIENTATION.HORIZONTAL)).toBe(false);
    });

    test('should return true for non-overlapping placements', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      expect(board.canPlaceShip(3, 1, 0, ORIENTATION.HORIZONTAL)).toBe(true);
      expect(board.canPlaceShip(3, 0, 3, ORIENTATION.HORIZONTAL)).toBe(true);
    });

    test('should handle adjacent ships correctly', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      expect(board.canPlaceShip(3, 10, ORIENTATION.HORIZONTAL)).toBe(true);
    });
  });

  describe('placeShip', () => {
    test('should successfully place a ship', () => {
      const result = board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      expect(result.success).toBe(true);
      expect(result.cells).toEqual([0, 1, 2]);
      expect(result.ship).toBeInstanceOf(Ship);
      expect(board.ships.length).toBe(1);
    });

    test('should fail when out of bounds', () => {
      const result = board.placeShip(3, 8, ORIENTATION.HORIZONTAL);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
      expect(board.ships.length).toBe(0);
    });

    test('should fail when overlapping', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      const result = board.placeShip(3, 0, ORIENTATION.VERTICAL);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('overlap');
      expect(board.ships.length).toBe(1);
    });

    test('should update occupied cells', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      expect(board.occupiedCells.has(0)).toBe(true);
      expect(board.occupiedCells.has(1)).toBe(true);
      expect(board.occupiedCells.has(2)).toBe(true);
      expect(board.occupiedCells.has(3)).toBe(false);
    });

    test('should update ship lookup', () => {
      const result = board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      expect(board.shipLookup.get(0)).toBe(result.ship);
      expect(board.shipLookup.get(1)).toBe(result.ship);
      expect(board.shipLookup.get(2)).toBe(result.ship);
      expect(board.shipLookup.get(3)).toBeUndefined();
    });

    test('should place multiple non-overlapping ships', () => {
      const result1 = board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      const result2 = board.placeShip(4, 10, ORIENTATION.HORIZONTAL);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(board.ships.length).toBe(2);
    });

    test('should handle vertical ship placement', () => {
      const result = board.placeShip(4, 0, ORIENTATION.VERTICAL);
      
      expect(result.success).toBe(true);
      expect(result.cells).toEqual([0, 10, 20, 30]);
      expect(board.occupiedCells.size).toBe(4);
    });
  });

  describe('previewPlacement', () => {
    test('should preview valid placement', () => {
      const preview = board.previewPlacement(3, 0, ORIENTATION.HORIZONTAL);
      
      expect(preview.cells).toEqual([0, 1, 2]);
      expect(preview.inBounds).toBe(true);
      expect(preview.overlaps).toBe(false);
      expect(preview.isValid).toBe(true);
    });

    test('should preview out of bounds placement', () => {
      const preview = board.previewPlacement(3, 8, ORIENTATION.HORIZONTAL);
      
      expect(preview.inBounds).toBe(false);
      expect(preview.isValid).toBe(false);
    });

    test('should preview overlapping placement', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      const preview = board.previewPlacement(3, 0, ORIENTATION.VERTICAL);
      
      expect(preview.overlaps).toBe(true);
      expect(preview.isValid).toBe(false);
    });

    test('should preview partially out of bounds', () => {
      const preview = board.previewPlacement(5, 9, ORIENTATION.HORIZONTAL);
      
      expect(preview.cells.length).toBeLessThan(5);
      expect(preview.isValid).toBe(false);
    });

    test('should handle vertical preview', () => {
      const preview = board.previewPlacement(4, 0, ORIENTATION.VERTICAL);
      
      expect(preview.cells).toEqual([0, 10, 20, 30]);
      expect(preview.isValid).toBe(true);
    });
  });

  describe('hasBeenAttacked', () => {
    test('should return false for unattacked cell', () => {
      expect(board.hasBeenAttacked(0)).toBe(false);
    });

    test('should return true for attacked cell', () => {
      board.receiveAttack(0);
      expect(board.hasBeenAttacked(0)).toBe(true);
    });

    test('should track multiple attacked cells', () => {
      board.receiveAttack(0);
      board.receiveAttack(10);
      board.receiveAttack(99);
      
      expect(board.hasBeenAttacked(0)).toBe(true);
      expect(board.hasBeenAttacked(10)).toBe(true);
      expect(board.hasBeenAttacked(99)).toBe(true);
      expect(board.hasBeenAttacked(50)).toBe(false);
    });
  });

  describe('receiveAttack', () => {
    test('should handle miss on empty cell', () => {
      const result = board.receiveAttack(0);
      
      expect(result.hit).toBe(false);
      expect(result.alreadyAttacked).toBeUndefined();
      expect(board.attackedCells.has(0)).toBe(true);
    });

    test('should handle hit on ship', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      const result = board.receiveAttack(1);
      
      expect(result.hit).toBe(true);
      expect(result.shipSunk).toBe(false);
      expect(result.ship).toBeInstanceOf(Ship);
      expect(board.attackedCells.has(1)).toBe(true);
    });

    test('should detect when ship is sunk', () => {
      board.placeShip(2, 0, ORIENTATION.HORIZONTAL);
      
      board.receiveAttack(0);
      const result = board.receiveAttack(1);
      
      expect(result.hit).toBe(true);
      expect(result.shipSunk).toBe(true);
    });

    test('should handle duplicate attack', () => {
      board.receiveAttack(0);
      const result = board.receiveAttack(0);
      
      expect(result.alreadyAttacked).toBe(true);
    });

    test('should track all attacks', () => {
      board.receiveAttack(0);
      board.receiveAttack(10);
      board.receiveAttack(20);
      
      expect(board.attackedCells.size).toBe(3);
    });

    test('should handle attack sequence on ship', () => {
      const placement = board.placeShip(3, 10, ORIENTATION.HORIZONTAL);
      
      const result1 = board.receiveAttack(10);
      expect(result1.hit).toBe(true);
      expect(result1.shipSunk).toBe(false);
      
      const result2 = board.receiveAttack(11);
      expect(result2.hit).toBe(true);
      expect(result2.shipSunk).toBe(false);
      
      const result3 = board.receiveAttack(12);
      expect(result3.hit).toBe(true);
      expect(result3.shipSunk).toBe(true);
    });
  });

  describe('randomUnattackedIndex', () => {
    test('should return valid index on empty board', () => {
      const index = board.randomUnattackedIndex();
      
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(100);
    });

    test('should not return already attacked cell', () => {
      board.receiveAttack(50);
      
      for (let i = 0; i < 10; i++) {
        const index = board.randomUnattackedIndex();
        expect(index).not.toBe(50);
      }
    });

    test('should return null when all cells attacked', () => {
      for (let i = 0; i < 100; i++) {
        board.receiveAttack(i);
      }
      
      const index = board.randomUnattackedIndex();
      expect(index).toBeNull();
    });

    test('should eventually return different indices', () => {
      const indices = new Set();
      for (let i = 0; i < 20; i++) {
        indices.add(board.randomUnattackedIndex());
      }
      
      expect(indices.size).toBeGreaterThan(1);
    });

    test('should work with partially attacked board', () => {
      for (let i = 0; i < 50; i++) {
        board.receiveAttack(i);
      }
      
      const index = board.randomUnattackedIndex();
      expect(index).toBeGreaterThanOrEqual(50);
      expect(index).toBeLessThan(100);
    });
  });

  describe('allShipsSunk', () => {
    test('should return false when no ships placed', () => {
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return false when ships not sunk', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return false when some ships sunk', () => {
      board.placeShip(2, 0, ORIENTATION.HORIZONTAL);
      board.placeShip(2, 10, ORIENTATION.HORIZONTAL);
      
      board.receiveAttack(0);
      board.receiveAttack(1);
      
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return true when all ships sunk', () => {
      board.placeShip(2, 0, ORIENTATION.HORIZONTAL);
      board.placeShip(2, 10, ORIENTATION.HORIZONTAL);
      
      board.receiveAttack(0);
      board.receiveAttack(1);
      board.receiveAttack(10);
      board.receiveAttack(11);
      
      expect(board.allShipsSunk()).toBe(true);
    });

    test('should handle single ship scenario', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      board.receiveAttack(0);
      board.receiveAttack(1);
      expect(board.allShipsSunk()).toBe(false);
      
      board.receiveAttack(2);
      expect(board.allShipsSunk()).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete game scenario', () => {
      // Place multiple ships
      board.placeShip(5, 0, ORIENTATION.HORIZONTAL);
      board.placeShip(3, 20, ORIENTATION.VERTICAL);
      
      expect(board.ships.length).toBe(2);
      
      // Attack and sink first ship
      for (let i = 0; i < 5; i++) {
        board.receiveAttack(i);
      }
      
      expect(board.ships[0].isSunk()).toBe(true);
      expect(board.allShipsSunk()).toBe(false);
      
      // Sink second ship
      board.receiveAttack(20);
      board.receiveAttack(30);
      board.receiveAttack(40);
      
      expect(board.allShipsSunk()).toBe(true);
    });

    test('should handle reset after complex state', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      board.placeShip(4, 10, ORIENTATION.VERTICAL);
      board.receiveAttack(0);
      board.receiveAttack(10);
      
      board.reset();
      
      expect(board.ships.length).toBe(0);
      expect(board.occupiedCells.size).toBe(0);
      expect(board.attackedCells.size).toBe(0);
      expect(board.shipLookup.size).toBe(0);
    });

    test('should handle edge case placements', () => {
      // Corner placements
      const corner1 = board.placeShip(1, 0, ORIENTATION.HORIZONTAL);
      const corner2 = board.placeShip(1, 9, ORIENTATION.HORIZONTAL);
      const corner3 = board.placeShip(1, 90, ORIENTATION.HORIZONTAL);
      const corner4 = board.placeShip(1, 99, ORIENTATION.HORIZONTAL);
      
      expect(corner1.success).toBe(true);
      expect(corner2.success).toBe(true);
      expect(corner3.success).toBe(true);
      expect(corner4.success).toBe(true);
      expect(board.ships.length).toBe(4);
    });
  });
});