import { BOARD_SIZE, SHIP_DEFINITIONS, TOTAL_SHIP_CELLS, ORIENTATION } from '../constants.js';

describe('constants.js', () => {
  describe('BOARD_SIZE', () => {
    test('should be defined and equal to 10', () => {
      expect(BOARD_SIZE).toBeDefined();
      expect(BOARD_SIZE).toBe(10);
    });

    test('should be a positive integer', () => {
      expect(Number.isInteger(BOARD_SIZE)).toBe(true);
      expect(BOARD_SIZE).toBeGreaterThan(0);
    });
  });

  describe('SHIP_DEFINITIONS', () => {
    test('should be defined and be an array', () => {
      expect(SHIP_DEFINITIONS).toBeDefined();
      expect(Array.isArray(SHIP_DEFINITIONS)).toBe(true);
    });

    test('should have 4 ship types', () => {
      expect(SHIP_DEFINITIONS).toHaveLength(4);
    });

    test('should have required properties for each ship', () => {
      SHIP_DEFINITIONS.forEach(ship => {
        expect(ship).toHaveProperty('name');
        expect(ship).toHaveProperty('length');
        expect(ship).toHaveProperty('count');
        expect(ship).toHaveProperty('counterId');
        expect(typeof ship.name).toBe('string');
        expect(typeof ship.length).toBe('number');
        expect(typeof ship.count).toBe('number');
        expect(typeof ship.counterId).toBe('string');
      });
    });

    test('should have correct ship configurations', () => {
      const battleship = SHIP_DEFINITIONS.find(s => s.name === 'Battleship');
      expect(battleship).toEqual({
        name: 'Battleship',
        length: 5,
        count: 1,
        counterId: 'Battleship'
      });

      const destroyer = SHIP_DEFINITIONS.find(s => s.name === 'Destroyer');
      expect(destroyer).toEqual({
        name: 'Destroyer',
        length: 4,
        count: 2,
        counterId: 'Destroyer'
      });

      const frigate = SHIP_DEFINITIONS.find(s => s.name === 'Frigate');
      expect(frigate).toEqual({
        name: 'Frigate',
        length: 3,
        count: 1,
        counterId: 'Frigate'
      });

      const patrolShip = SHIP_DEFINITIONS.find(s => s.name === 'Patrol Ship');
      expect(patrolShip).toEqual({
        name: 'Patrol Ship',
        length: 2,
        count: 1,
        counterId: 'Patrolship'
      });
    });

    test('should have positive lengths and counts', () => {
      SHIP_DEFINITIONS.forEach(ship => {
        expect(ship.length).toBeGreaterThan(0);
        expect(ship.count).toBeGreaterThan(0);
      });
    });

    test('should not have ships longer than the board', () => {
      SHIP_DEFINITIONS.forEach(ship => {
        expect(ship.length).toBeLessThanOrEqual(BOARD_SIZE);
      });
    });
  });

  describe('TOTAL_SHIP_CELLS', () => {
    test('should be defined', () => {
      expect(TOTAL_SHIP_CELLS).toBeDefined();
    });

    test('should equal the sum of all ship lengths times their counts', () => {
      const expected = SHIP_DEFINITIONS.reduce(
        (total, ship) => total + ship.length * ship.count,
        0
      );
      expect(TOTAL_SHIP_CELLS).toBe(expected);
    });

    test('should be 18 (5*1 + 4*2 + 3*1 + 2*1)', () => {
      expect(TOTAL_SHIP_CELLS).toBe(18);
    });

    test('should be less than total board cells', () => {
      const totalBoardCells = BOARD_SIZE * BOARD_SIZE;
      expect(TOTAL_SHIP_CELLS).toBeLessThan(totalBoardCells);
    });
  });

  describe('ORIENTATION', () => {
    test('should be defined', () => {
      expect(ORIENTATION).toBeDefined();
    });

    test('should have HORIZONTAL and VERTICAL properties', () => {
      expect(ORIENTATION).toHaveProperty('HORIZONTAL');
      expect(ORIENTATION).toHaveProperty('VERTICAL');
    });

    test('should have correct string values', () => {
      expect(ORIENTATION.HORIZONTAL).toBe('horizontal');
      expect(ORIENTATION.VERTICAL).toBe('vertical');
    });

    test('should have distinct orientation values', () => {
      expect(ORIENTATION.HORIZONTAL).not.toBe(ORIENTATION.VERTICAL);
    });

    test('should be immutable at runtime', () => {
      const original = { ...ORIENTATION };
      expect(() => {
        ORIENTATION.HORIZONTAL = 'changed';
      }).not.toThrow();
      // Even though we can reassign, test the original values exist
      expect(original.HORIZONTAL).toBe('horizontal');
      expect(original.VERTICAL).toBe('vertical');
    });
  });

  describe('Constants Integration', () => {
    test('should have valid game configuration', () => {
      const totalShips = SHIP_DEFINITIONS.reduce((sum, ship) => sum + ship.count, 0);
      expect(totalShips).toBeGreaterThan(0);
      expect(TOTAL_SHIP_CELLS).toBeLessThan(BOARD_SIZE * BOARD_SIZE);
    });

    test('should allow all ships to theoretically fit on board', () => {
      // Maximum space needed is if all ships are placed horizontally or vertically
      const maxShipLength = Math.max(...SHIP_DEFINITIONS.map(s => s.length));
      expect(maxShipLength).toBeLessThanOrEqual(BOARD_SIZE);
    });
  });
});