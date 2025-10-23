import { Ship } from '../ship.js';

describe('Ship', () => {
  describe('constructor', () => {
    test('should create a ship with given length and cells', () => {
      const cells = [0, 1, 2];
      const ship = new Ship(3, cells);
      
      expect(ship.length).toBe(3);
      expect(ship.cells).toBeInstanceOf(Set);
      expect(ship.cells.size).toBe(3);
      expect(ship.hits).toBeInstanceOf(Set);
      expect(ship.hits.size).toBe(0);
    });

    test('should assign unique IDs to different ships', () => {
      const ship1 = new Ship(3, [0, 1, 2]);
      const ship2 = new Ship(4, [10, 11, 12, 13]);
      
      expect(ship1.id).toBeDefined();
      expect(ship2.id).toBeDefined();
      expect(ship1.id).not.toBe(ship2.id);
      expect(ship1.id).toMatch(/^ship-\d+$/);
      expect(ship2.id).toMatch(/^ship-\d+$/);
    });

    test('should handle empty cell array', () => {
      const ship = new Ship(0, []);
      
      expect(ship.length).toBe(0);
      expect(ship.cells.size).toBe(0);
    });

    test('should handle single cell ship', () => {
      const ship = new Ship(1, [42]);
      
      expect(ship.length).toBe(1);
      expect(ship.cells.size).toBe(1);
      expect(ship.cells.has(42)).toBe(true);
    });

    test('should handle duplicate cells in input array', () => {
      const ship = new Ship(3, [5, 5, 5]);
      
      expect(ship.cells.size).toBe(1);
      expect(ship.cells.has(5)).toBe(true);
    });

    test('should handle large ship', () => {
      const cells = Array.from({ length: 10 }, (_, i) => i);
      const ship = new Ship(10, cells);
      
      expect(ship.length).toBe(10);
      expect(ship.cells.size).toBe(10);
    });
  });

  describe('occupies', () => {
    test('should return true for cells the ship occupies', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      expect(ship.occupies(10)).toBe(true);
      expect(ship.occupies(11)).toBe(true);
      expect(ship.occupies(12)).toBe(true);
    });

    test('should return false for cells the ship does not occupy', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      expect(ship.occupies(0)).toBe(false);
      expect(ship.occupies(9)).toBe(false);
      expect(ship.occupies(13)).toBe(false);
      expect(ship.occupies(99)).toBe(false);
    });

    test('should return false for negative indices', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      expect(ship.occupies(-1)).toBe(false);
      expect(ship.occupies(-10)).toBe(false);
    });

    test('should return false for undefined or null', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      expect(ship.occupies(undefined)).toBe(false);
      expect(ship.occupies(null)).toBe(false);
    });

    test('should work with single cell ship', () => {
      const ship = new Ship(1, [5]);
      
      expect(ship.occupies(5)).toBe(true);
      expect(ship.occupies(4)).toBe(false);
      expect(ship.occupies(6)).toBe(false);
    });
  });

  describe('recordHit', () => {
    test('should record hit on occupied cell', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(11);
      
      expect(ship.hits.size).toBe(1);
      expect(ship.hits.has(11)).toBe(true);
    });

    test('should record multiple hits on different cells', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(10);
      ship.recordHit(12);
      
      expect(ship.hits.size).toBe(2);
      expect(ship.hits.has(10)).toBe(true);
      expect(ship.hits.has(12)).toBe(true);
      expect(ship.hits.has(11)).toBe(false);
    });

    test('should ignore hit on non-occupied cell', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(99);
      
      expect(ship.hits.size).toBe(0);
    });

    test('should handle duplicate hits on same cell', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(11);
      ship.recordHit(11);
      ship.recordHit(11);
      
      expect(ship.hits.size).toBe(1);
      expect(ship.hits.has(11)).toBe(true);
    });

    test('should not record hit on negative index', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(-1);
      
      expect(ship.hits.size).toBe(0);
    });

    test('should handle all cells hit', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(10);
      ship.recordHit(11);
      ship.recordHit(12);
      
      expect(ship.hits.size).toBe(3);
      expect(ship.hits.has(10)).toBe(true);
      expect(ship.hits.has(11)).toBe(true);
      expect(ship.hits.has(12)).toBe(true);
    });
  });

  describe('isSunk', () => {
    test('should return false when no hits recorded', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when partially hit', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(10);
      expect(ship.isSunk()).toBe(false);
      
      ship.recordHit(11);
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all cells are hit', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(10);
      ship.recordHit(11);
      ship.recordHit(12);
      
      expect(ship.isSunk()).toBe(true);
    });

    test('should return true for single-cell ship when hit', () => {
      const ship = new Ship(1, [5]);
      
      ship.recordHit(5);
      
      expect(ship.isSunk()).toBe(true);
    });

    test('should handle empty ship', () => {
      const ship = new Ship(0, []);
      
      expect(ship.isSunk()).toBe(true);
    });

    test('should remain sunk after additional invalid hits', () => {
      const ship = new Ship(2, [10, 11]);
      
      ship.recordHit(10);
      ship.recordHit(11);
      expect(ship.isSunk()).toBe(true);
      
      ship.recordHit(99);
      expect(ship.isSunk()).toBe(true);
    });

    test('should handle large ship sinking', () => {
      const cells = [0, 10, 20, 30, 40];
      const ship = new Ship(5, cells);
      
      cells.forEach((cell, index) => {
        if (index < cells.length - 1) {
          ship.recordHit(cell);
          expect(ship.isSunk()).toBe(false);
        }
      });
      
      ship.recordHit(cells[cells.length - 1]);
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('Edge cases and integration', () => {
    test('should maintain state across multiple operations', () => {
      const ship = new Ship(4, [20, 21, 22, 23]);
      
      expect(ship.occupies(21)).toBe(true);
      expect(ship.isSunk()).toBe(false);
      
      ship.recordHit(20);
      expect(ship.occupies(21)).toBe(true);
      expect(ship.isSunk()).toBe(false);
      
      ship.recordHit(21);
      ship.recordHit(22);
      expect(ship.isSunk()).toBe(false);
      
      ship.recordHit(23);
      expect(ship.isSunk()).toBe(true);
      expect(ship.occupies(21)).toBe(true);
    });

    test('should handle non-contiguous cells', () => {
      const ship = new Ship(3, [1, 5, 9]);
      
      expect(ship.occupies(1)).toBe(true);
      expect(ship.occupies(5)).toBe(true);
      expect(ship.occupies(9)).toBe(true);
      expect(ship.occupies(2)).toBe(false);
      
      ship.recordHit(1);
      ship.recordHit(5);
      ship.recordHit(9);
      
      expect(ship.isSunk()).toBe(true);
    });

    test('should not be affected by hits to non-occupied adjacent cells', () => {
      const ship = new Ship(3, [10, 11, 12]);
      
      ship.recordHit(9);
      ship.recordHit(13);
      
      expect(ship.hits.size).toBe(0);
      expect(ship.isSunk()).toBe(false);
    });
  });
});