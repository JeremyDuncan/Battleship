import { AIController } from '../ai-controller.js';
import { Board } from '../board.js';
import { ORIENTATION } from '../constants.js';

describe('AIController', () => {
  let board;
  let ai;

  beforeEach(() => {
    board = new Board();
    ai = new AIController(board);
  });

  describe('constructor', () => {
    test('should initialize with a board reference', () => {
      expect(ai.board).toBe(board);
    });

    test('should initialize with empty focus queue', () => {
      expect(ai.focusQueue).toEqual([]);
    });

    test('should initialize with empty focus registry', () => {
      expect(ai.focusRegistry).toBeInstanceOf(Set);
      expect(ai.focusRegistry.size).toBe(0);
    });

    test('should accept different board instances', () => {
      const board2 = new Board();
      const ai2 = new AIController(board2);
      expect(ai2.board).toBe(board2);
      expect(ai2.board).not.toBe(board);
    });
  });

  describe('reset', () => {
    test('should clear focus queue', () => {
      ai.focusQueue = [1, 2, 3];
      ai.reset();
      expect(ai.focusQueue).toEqual([]);
    });

    test('should clear focus registry', () => {
      ai.focusRegistry.add(10);
      ai.focusRegistry.add(20);
      ai.reset();
      expect(ai.focusRegistry.size).toBe(0);
    });

    test('should be idempotent', () => {
      ai.reset();
      ai.reset();
      expect(ai.focusQueue).toEqual([]);
      expect(ai.focusRegistry.size).toBe(0);
    });

    test('should not affect board state', () => {
      board.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      ai.reset();
      expect(board.ships.length).toBe(1);
    });
  });

  describe('nextAttack', () => {
    test('should return valid index on empty board', () => {
      const target = ai.nextAttack();
      expect(target).toBeGreaterThanOrEqual(0);
      expect(target).toBeLessThan(100);
    });

    test('should return index from focus queue when available', () => {
      ai.focusQueue.push(42);
      const target = ai.nextAttack();
      expect(target).toBe(42);
    });

    test('should skip already attacked cells in focus queue', () => {
      board.receiveAttack(10);
      ai.focusQueue.push(10, 11, 12);
      
      const target = ai.nextAttack();
      expect(target).toBe(11);
    });

    test('should drain focus queue before using random', () => {
      ai.focusQueue.push(5, 15, 25);
      
      expect(ai.nextAttack()).toBe(5);
      expect(ai.nextAttack()).toBe(15);
      expect(ai.nextAttack()).toBe(25);
    });

    test('should fallback to random when focus queue empty', () => {
      const target = ai.nextAttack();
      expect(target).toBeGreaterThanOrEqual(0);
      expect(target).toBeLessThan(100);
    });

    test('should return null when board fully attacked', () => {
      for (let i = 0; i < 100; i++) {
        board.receiveAttack(i);
      }
      const target = ai.nextAttack();
      expect(target).toBeNull();
    });

    test('should handle partially attacked cells in queue', () => {
      board.receiveAttack(20);
      board.receiveAttack(21);
      ai.focusQueue.push(20, 21, 22);
      
      const target = ai.nextAttack();
      expect(target).toBe(22);
    });

    test('should not return same cell twice in sequence', () => {
      const target1 = ai.nextAttack();
      board.receiveAttack(target1);
      const target2 = ai.nextAttack();
      
      if (target2 !== null) {
        expect(target2).not.toBe(target1);
      }
    });
  });

  describe('handleAttackResult', () => {
    test('should do nothing for null result', () => {
      ai.handleAttackResult(10, null);
      expect(ai.focusQueue.length).toBe(0);
    });

    test('should do nothing for undefined result', () => {
      ai.handleAttackResult(10, undefined);
      expect(ai.focusQueue.length).toBe(0);
    });

    test('should do nothing for already attacked result', () => {
      ai.handleAttackResult(10, { alreadyAttacked: true });
      expect(ai.focusQueue.length).toBe(0);
    });

    test('should do nothing on miss', () => {
      ai.handleAttackResult(10, { hit: false });
      expect(ai.focusQueue.length).toBe(0);
    });

    test('should enqueue neighbors on hit', () => {
      ai.handleAttackResult(55, { hit: true });
      
      expect(ai.focusQueue.length).toBeGreaterThan(0);
      expect(ai.focusRegistry.size).toBeGreaterThan(0);
    });

    test('should reset on ship sunk', () => {
      ai.focusQueue.push(1, 2, 3);
      ai.focusRegistry.add(1);
      ai.focusRegistry.add(2);
      
      ai.handleAttackResult(10, { hit: true, shipSunk: true });
      
      expect(ai.focusQueue).toEqual([]);
      expect(ai.focusRegistry.size).toBe(0);
    });

    test('should not reset on hit without sinking', () => {
      ai.handleAttackResult(10, { hit: true, shipSunk: false });
      expect(ai.focusQueue.length).toBeGreaterThan(0);
    });

    test('should handle multiple sequential hits', () => {
      ai.handleAttackResult(50, { hit: true });
      const queueLength1 = ai.focusQueue.length;
      
      ai.handleAttackResult(51, { hit: true });
      const queueLength2 = ai.focusQueue.length;
      
      expect(queueLength2).toBeGreaterThan(0);
    });
  });

  describe('enqueueNeighbors', () => {
    test('should enqueue all valid neighbors for center cell', () => {
      ai.enqueueNeighbors(55);
      
      expect(ai.focusQueue).toContain(45); // above
      expect(ai.focusQueue).toContain(65); // below
      expect(ai.focusQueue).toContain(54); // left
      expect(ai.focusQueue).toContain(56); // right
      expect(ai.focusQueue.length).toBe(4);
    });

    test('should handle top-left corner', () => {
      ai.enqueueNeighbors(0);
      
      expect(ai.focusQueue).toContain(10); // below
      expect(ai.focusQueue).toContain(1);  // right
      expect(ai.focusQueue.length).toBe(2);
    });

    test('should handle top-right corner', () => {
      ai.enqueueNeighbors(9);
      
      expect(ai.focusQueue).toContain(19); // below
      expect(ai.focusQueue).toContain(8);  // left
      expect(ai.focusQueue.length).toBe(2);
    });

    test('should handle bottom-left corner', () => {
      ai.enqueueNeighbors(90);
      
      expect(ai.focusQueue).toContain(80); // above
      expect(ai.focusQueue).toContain(91); // right
      expect(ai.focusQueue.length).toBe(2);
    });

    test('should handle bottom-right corner', () => {
      ai.enqueueNeighbors(99);
      
      expect(ai.focusQueue).toContain(89); // above
      expect(ai.focusQueue).toContain(98); // left
      expect(ai.focusQueue.length).toBe(2);
    });

    test('should handle top edge', () => {
      ai.enqueueNeighbors(5);
      
      expect(ai.focusQueue).toContain(4);  // left
      expect(ai.focusQueue).toContain(6);  // right
      expect(ai.focusQueue).toContain(15); // below
      expect(ai.focusQueue.length).toBe(3);
    });

    test('should handle bottom edge', () => {
      ai.enqueueNeighbors(95);
      
      expect(ai.focusQueue).toContain(85); // above
      expect(ai.focusQueue).toContain(94); // left
      expect(ai.focusQueue).toContain(96); // right
      expect(ai.focusQueue.length).toBe(3);
    });

    test('should handle left edge', () => {
      ai.enqueueNeighbors(50);
      
      expect(ai.focusQueue).toContain(40); // above
      expect(ai.focusQueue).toContain(60); // below
      expect(ai.focusQueue).toContain(51); // right
      expect(ai.focusQueue.length).toBe(3);
    });

    test('should handle right edge', () => {
      ai.enqueueNeighbors(59);
      
      expect(ai.focusQueue).toContain(49); // above
      expect(ai.focusQueue).toContain(69); // below
      expect(ai.focusQueue).toContain(58); // left
      expect(ai.focusQueue.length).toBe(3);
    });

    test('should not enqueue duplicates', () => {
      ai.enqueueNeighbors(55);
      const initialLength = ai.focusQueue.length;
      
      ai.enqueueNeighbors(55);
      
      expect(ai.focusQueue.length).toBe(initialLength);
    });

    test('should track enqueued indices in registry', () => {
      ai.enqueueNeighbors(55);
      
      expect(ai.focusRegistry.has(45)).toBe(true);
      expect(ai.focusRegistry.has(65)).toBe(true);
      expect(ai.focusRegistry.has(54)).toBe(true);
      expect(ai.focusRegistry.has(56)).toBe(true);
    });

    test('should not enqueue already registered cells', () => {
      ai.focusRegistry.add(45);
      ai.enqueueNeighbors(55);
      
      const count45 = ai.focusQueue.filter(x => x === 45).length;
      expect(count45).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete hunt and target sequence', () => {
      board.placeShip(3, 55, ORIENTATION.HORIZONTAL); // cells 55, 56, 57
      
      // First hit
      const target1 = ai.nextAttack();
      const result1 = board.receiveAttack(55);
      ai.handleAttackResult(55, result1);
      
      expect(result1.hit).toBe(true);
      expect(ai.focusQueue.length).toBeGreaterThan(0);
      
      // Should target neighbors
      const target2 = ai.nextAttack();
      expect([45, 65, 54, 56]).toContain(target2);
    });

    test('should reset after sinking ship', () => {
      board.placeShip(2, 50, ORIENTATION.HORIZONTAL);
      
      const result1 = board.receiveAttack(50);
      ai.handleAttackResult(50, result1);
      expect(ai.focusQueue.length).toBeGreaterThan(0);
      
      const result2 = board.receiveAttack(51);
      ai.handleAttackResult(51, result2);
      expect(result2.shipSunk).toBe(true);
      expect(ai.focusQueue.length).toBe(0);
      expect(ai.focusRegistry.size).toBe(0);
    });

    test('should handle hitting multiple ships without sinking', () => {
      board.placeShip(3, 20, ORIENTATION.HORIZONTAL);
      board.placeShip(3, 50, ORIENTATION.HORIZONTAL);
      
      const result1 = board.receiveAttack(20);
      ai.handleAttackResult(20, result1);
      const queueSize1 = ai.focusQueue.length;
      
      const result2 = board.receiveAttack(50);
      ai.handleAttackResult(50, result2);
      const queueSize2 = ai.focusQueue.length;
      
      expect(queueSize2).toBeGreaterThan(queueSize1);
    });

    test('should handle edge case with no remaining targets', () => {
      for (let i = 0; i < 100; i++) {
        board.receiveAttack(i);
      }
      
      const target = ai.nextAttack();
      expect(target).toBeNull();
    });

    test('should efficiently target after first hit', () => {
      board.placeShip(5, 0, ORIENTATION.HORIZONTAL);
      
      // Hit at index 2
      const result = board.receiveAttack(2);
      ai.handleAttackResult(2, result);
      
      // Next attacks should be neighbors
      const possibleTargets = [1, 3, 12];
      const target = ai.nextAttack();
      expect(possibleTargets).toContain(target);
    });

    test('should handle multiple resets in a game', () => {
      board.placeShip(2, 10, ORIENTATION.HORIZONTAL);
      board.placeShip(2, 20, ORIENTATION.HORIZONTAL);
      
      // Sink first ship
      board.receiveAttack(10);
      ai.handleAttackResult(10, board.receiveAttack(10));
      board.receiveAttack(11);
      ai.handleAttackResult(11, board.receiveAttack(11));
      
      expect(ai.focusQueue.length).toBe(0);
      
      // Hit second ship
      const result = board.receiveAttack(20);
      ai.handleAttackResult(20, result);
      
      expect(ai.focusQueue.length).toBeGreaterThan(0);
    });

    test('should work with board that filters attacked cells', () => {
      // Attack some cells
      board.receiveAttack(54);
      board.receiveAttack(56);
      
      // Hit a ship
      board.placeShip(3, 55, ORIENTATION.HORIZONTAL);
      const result = board.receiveAttack(55);
      ai.handleAttackResult(55, result);
      
      // Next attack should skip already attacked neighbors
      const target = ai.nextAttack();
      expect(target).not.toBe(54);
      expect(target).not.toBe(56);
    });

    test('should handle rapid succession of hits', () => {
      board.placeShip(5, 50, ORIENTATION.HORIZONTAL);
      
      for (let i = 50; i < 55; i++) {
        const result = board.receiveAttack(i);
        ai.handleAttackResult(i, result);
      }
      
      // After sinking, should be reset
      expect(ai.focusQueue.length).toBe(0);
      expect(ai.focusRegistry.size).toBe(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle null board gracefully in constructor', () => {
      expect(() => new AIController(null)).not.toThrow();
    });

    test('should handle undefined result in handleAttackResult', () => {
      expect(() => ai.handleAttackResult(0, undefined)).not.toThrow();
    });

    test('should handle invalid index in enqueueNeighbors', () => {
      expect(() => ai.enqueueNeighbors(-1)).not.toThrow();
      expect(() => ai.enqueueNeighbors(100)).not.toThrow();
    });

    test('should handle empty result object', () => {
      expect(() => ai.handleAttackResult(0, {})).not.toThrow();
    });

    test('should maintain state integrity after errors', () => {
      ai.focusQueue.push(10, 20);
      ai.handleAttackResult(null, null);
      expect(ai.focusQueue).toEqual([10, 20]);
    });
  });
});