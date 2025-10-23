import { BattleshipGame } from '../game.js';
import { Board } from '../board.js';
import { AIController } from '../ai-controller.js';
import { ORIENTATION, SHIP_DEFINITIONS } from '../constants.js';

describe('BattleshipGame', () => {
  let mockUI;
  let game;

  beforeEach(() => {
    // Create comprehensive mock UI
    mockUI = {
      clearMessage: jest.fn(),
      clearAnnouncement: jest.fn(),
      clearPlacementPreview: jest.fn(),
      setMessage: jest.fn(),
      updateShipCount: jest.fn(),
      showPlacementPreview: jest.fn(),
      renderShip: jest.fn(),
      prepareForBattle: jest.fn(),
      renderHit: jest.fn(),
      renderMiss: jest.fn(),
      showVictory: jest.fn(),
      showDefeat: jest.fn(),
    };

    game = new BattleshipGame(mockUI);
  });

  describe('constructor and initialization', () => {
    test('should store UI controller reference', () => {
      expect(game.ui).toBe(mockUI);
    });

    test('should initialize player board', () => {
      expect(game.playerBoard).toBeInstanceOf(Board);
    });

    test('should initialize CPU board', () => {
      expect(game.cpuBoard).toBeInstanceOf(Board);
    });

    test('should initialize AI controller', () => {
      expect(game.ai).toBeInstanceOf(AIController);
    });

    test('should initialize with horizontal orientation', () => {
      expect(game.orientation).toBe(ORIENTATION.HORIZONTAL);
    });

    test('should initialize ship inventory from definitions', () => {
      expect(game.shipInventory).toBeDefined();
      expect(game.shipInventory.length).toBe(SHIP_DEFINITIONS.length);
    });

    test('should set correct initial ships to place', () => {
      const expectedShipsToPlace = SHIP_DEFINITIONS.reduce(
        (total, ship) => total + ship.count,
        0
      );
      expect(game.shipsToPlace).toBe(expectedShipsToPlace);
    });

    test('should initialize with game not started', () => {
      expect(game.gameStarted).toBe(false);
    });

    test('should initialize hit counters to zero', () => {
      expect(game.playerHits).toBe(0);
      expect(game.cpuHits).toBe(0);
    });

    test('should call UI initialization methods', () => {
      expect(mockUI.clearMessage).toHaveBeenCalled();
      expect(mockUI.clearAnnouncement).toHaveBeenCalled();
      expect(mockUI.clearPlacementPreview).toHaveBeenCalled();
    });

    test('should initialize ship counts in UI', () => {
      SHIP_DEFINITIONS.forEach(ship => {
        expect(mockUI.updateShipCount).toHaveBeenCalledWith(
          ship.counterId,
          ship.count
        );
      });
    });
  });

  describe('initializeState', () => {
    test('should reset all boards', () => {
      game.playerBoard.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      game.cpuBoard.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      game.initializeState();
      
      expect(game.playerBoard.ships.length).toBe(0);
      expect(game.cpuBoard.ships.length).toBe(0);
    });

    test('should reset ship inventory', () => {
      game.shipInventory[0].remaining = 0;
      game.initializeState();
      
      game.shipInventory.forEach((ship, index) => {
        expect(ship.remaining).toBe(SHIP_DEFINITIONS[index].count);
      });
    });

    test('should reset orientation to horizontal', () => {
      game.orientation = ORIENTATION.VERTICAL;
      game.initializeState();
      expect(game.orientation).toBe(ORIENTATION.HORIZONTAL);
    });

    test('should reset selected ship length', () => {
      game.selectedShipLength = 5;
      game.initializeState();
      expect(game.selectedShipLength).toBe(0);
    });

    test('should reset game started flag', () => {
      game.gameStarted = true;
      game.initializeState();
      expect(game.gameStarted).toBe(false);
    });

    test('should reset hit counters', () => {
      game.playerHits = 10;
      game.cpuHits = 5;
      game.initializeState();
      
      expect(game.playerHits).toBe(0);
      expect(game.cpuHits).toBe(0);
    });
  });

  describe('getShipSpec', () => {
    test('should return ship specification by length', () => {
      const spec = game.getShipSpec(5);
      expect(spec).toBeDefined();
      expect(spec.length).toBe(5);
      expect(spec.name).toBe('Battleship');
    });

    test('should return undefined for invalid length', () => {
      const spec = game.getShipSpec(99);
      expect(spec).toBeUndefined();
    });

    test('should return first matching ship for duplicate lengths', () => {
      const spec = game.getShipSpec(4);
      expect(spec).toBeDefined();
      expect(spec.length).toBe(4);
    });

    test('should handle zero length', () => {
      const spec = game.getShipSpec(0);
      expect(spec).toBeUndefined();
    });

    test('should handle negative length', () => {
      const spec = game.getShipSpec(-1);
      expect(spec).toBeUndefined();
    });
  });

  describe('setOrientation', () => {
    test('should set orientation to vertical', () => {
      game.setOrientation(ORIENTATION.VERTICAL);
      expect(game.orientation).toBe(ORIENTATION.VERTICAL);
    });

    test('should set orientation to horizontal', () => {
      game.setOrientation(ORIENTATION.HORIZONTAL);
      expect(game.orientation).toBe(ORIENTATION.HORIZONTAL);
    });

    test('should clear placement preview', () => {
      mockUI.clearPlacementPreview.mockClear();
      game.setOrientation(ORIENTATION.VERTICAL);
      expect(mockUI.clearPlacementPreview).toHaveBeenCalled();
    });

    test('should display vertical message', () => {
      game.setOrientation(ORIENTATION.VERTICAL);
      expect(mockUI.setMessage).toHaveBeenCalledWith('Orientation set to Vertical.');
    });

    test('should display horizontal message', () => {
      game.setOrientation(ORIENTATION.HORIZONTAL);
      expect(mockUI.setMessage).toHaveBeenCalledWith('Orientation set to Horizontal.');
    });

    test('should handle rapid orientation changes', () => {
      game.setOrientation(ORIENTATION.VERTICAL);
      game.setOrientation(ORIENTATION.HORIZONTAL);
      game.setOrientation(ORIENTATION.VERTICAL);
      expect(game.orientation).toBe(ORIENTATION.VERTICAL);
    });
  });

  describe('selectShip', () => {
    test('should select ship with valid length', () => {
      game.selectShip(5);
      expect(game.selectedShipLength).toBe(5);
    });

    test('should display selection message', () => {
      game.selectShip(5);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('Battleship selected')
      );
    });

    test('should show remaining count in message', () => {
      game.selectShip(5);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('1 remaining')
      );
    });

    test('should reject selection of depleted ship', () => {
      const ship = game.getShipSpec(5);
      ship.remaining = 0;
      
      game.selectShip(5);
      
      expect(game.selectedShipLength).toBe(0);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('All Battleships placed')
      );
    });

    test('should clear preview on selection', () => {
      mockUI.clearPlacementPreview.mockClear();
      game.selectShip(5);
      expect(mockUI.clearPlacementPreview).toHaveBeenCalled();
    });

    test('should handle unknown ship length', () => {
      game.selectShip(99);
      expect(mockUI.setMessage).toHaveBeenCalledWith('Unknown ship selection.');
    });

    test('should allow reselecting same ship', () => {
      game.selectShip(5);
      game.selectShip(5);
      expect(game.selectedShipLength).toBe(5);
    });
  });

  describe('previewPlayerPlacement', () => {
    test('should show preview when ship selected', () => {
      game.selectShip(3);
      game.previewPlayerPlacement(0);
      
      expect(mockUI.showPlacementPreview).toHaveBeenCalled();
    });

    test('should not show preview when no ship selected', () => {
      game.previewPlayerPlacement(0);
      expect(mockUI.showPlacementPreview).not.toHaveBeenCalled();
    });

    test('should not show preview when game started', () => {
      game.selectShip(3);
      game.gameStarted = true;
      
      game.previewPlayerPlacement(0);
      
      expect(mockUI.showPlacementPreview).not.toHaveBeenCalled();
    });

    test('should not show preview for depleted ship', () => {
      const ship = game.getShipSpec(3);
      ship.remaining = 0;
      game.selectedShipLength = 3;
      
      game.previewPlayerPlacement(0);
      
      expect(mockUI.showPlacementPreview).not.toHaveBeenCalled();
    });

    test('should show valid preview for good placement', () => {
      game.selectShip(3);
      game.previewPlayerPlacement(0);
      
      expect(mockUI.showPlacementPreview).toHaveBeenCalledWith(
        expect.any(Array),
        true
      );
    });

    test('should show invalid preview for out of bounds', () => {
      game.selectShip(5);
      game.previewPlayerPlacement(8);
      
      expect(mockUI.showPlacementPreview).toHaveBeenCalledWith(
        expect.any(Array),
        false
      );
    });

    test('should handle different orientations', () => {
      game.setOrientation(ORIENTATION.VERTICAL);
      game.selectShip(3);
      game.previewPlayerPlacement(0);
      
      expect(mockUI.showPlacementPreview).toHaveBeenCalled();
    });
  });

  describe('clearPlacementPreview', () => {
    test('should call UI clearPlacementPreview', () => {
      game.clearPlacementPreview();
      expect(mockUI.clearPlacementPreview).toHaveBeenCalled();
    });

    test('should be callable multiple times', () => {
      game.clearPlacementPreview();
      game.clearPlacementPreview();
      expect(mockUI.clearPlacementPreview).toHaveBeenCalledTimes(2);
    });
  });

  describe('placePlayerShip', () => {
    test('should successfully place ship', () => {
      game.selectShip(3);
      game.placePlayerShip(0);
      
      expect(game.playerBoard.ships.length).toBe(1);
      expect(mockUI.renderShip).toHaveBeenCalled();
    });

    test('should decrease ship count', () => {
      game.selectShip(3);
      const initialRemaining = game.getShipSpec(3).remaining;
      
      game.placePlayerShip(0);
      
      expect(game.getShipSpec(3).remaining).toBe(initialRemaining - 1);
    });

    test('should update UI ship count', () => {
      mockUI.updateShipCount.mockClear();
      game.selectShip(3);
      game.placePlayerShip(0);
      
      expect(mockUI.updateShipCount).toHaveBeenCalled();
    });

    test('should decrease ships to place counter', () => {
      game.selectShip(3);
      const initialCount = game.shipsToPlace;
      
      game.placePlayerShip(0);
      
      expect(game.shipsToPlace).toBe(initialCount - 1);
    });

    test('should reject placement when no ship selected', () => {
      game.placePlayerShip(0);
      
      expect(game.playerBoard.ships.length).toBe(0);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('Select a ship')
      );
    });

    test('should reject placement after game started', () => {
      game.selectShip(3);
      game.gameStarted = true;
      
      game.placePlayerShip(0);
      
      expect(game.playerBoard.ships.length).toBe(0);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('Cannot place ships after')
      );
    });

    test('should reject out of bounds placement', () => {
      game.selectShip(5);
      game.placePlayerShip(8);
      
      expect(game.playerBoard.ships.length).toBe(0);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('out of bounds')
      );
    });

    test('should reject overlapping placement', () => {
      game.selectShip(3);
      game.placePlayerShip(0);
      game.placePlayerShip(0);
      
      expect(game.playerBoard.ships.length).toBe(1);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('overlaps')
      );
    });

    test('should deselect ship when all placed', () => {
      game.selectShip(3); // Frigate has count 1
      game.placePlayerShip(0);
      
      expect(game.selectedShipLength).toBe(0);
    });

    test('should not deselect when more ships available', () => {
      game.selectShip(4); // Destroyer has count 2
      game.placePlayerShip(0);
      
      expect(game.selectedShipLength).toBe(4);
    });

    test('should handle vertical placement', () => {
      game.setOrientation(ORIENTATION.VERTICAL);
      game.selectShip(3);
      game.placePlayerShip(0);
      
      expect(game.playerBoard.ships.length).toBe(1);
    });
  });

  describe('canStartGame', () => {
    test('should return false initially', () => {
      expect(game.canStartGame()).toBe(false);
    });

    test('should return true when all ships placed', () => {
      game.shipsToPlace = 0;
      expect(game.canStartGame()).toBe(true);
    });

    test('should return false with ships remaining', () => {
      game.shipsToPlace = 1;
      expect(game.canStartGame()).toBe(false);
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      // Place all required ships
      game.shipsToPlace = 0;
    });

    test('should start game when all ships placed', () => {
      game.startGame();
      expect(game.gameStarted).toBe(true);
    });

    test('should deploy CPU fleet', () => {
      game.startGame();
      expect(game.cpuBoard.ships.length).toBeGreaterThan(0);
    });

    test('should call prepareForBattle on UI', () => {
      game.startGame();
      expect(mockUI.prepareForBattle).toHaveBeenCalled();
    });

    test('should display start message', () => {
      game.startGame();
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('Game started')
      );
    });

    test('should reject start when ships not placed', () => {
      game.shipsToPlace = 1;
      game.startGame();
      
      expect(game.gameStarted).toBe(false);
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('Place all ships')
      );
    });

    test('should reject start when already started', () => {
      game.startGame();
      mockUI.setMessage.mockClear();
      game.startGame();
      
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('already in progress')
      );
    });

    test('should clear placement preview', () => {
      mockUI.clearPlacementPreview.mockClear();
      game.startGame();
      expect(mockUI.clearPlacementPreview).toHaveBeenCalled();
    });
  });

  describe('playerAttack', () => {
    beforeEach(() => {
      game.shipsToPlace = 0;
      game.startGame();
    });

    test('should reject attack before game started', () => {
      game.gameStarted = false;
      game.playerAttack(0);
      
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('not started')
      );
    });

    test('should handle miss', () => {
      game.playerAttack(0);
      expect(mockUI.renderMiss).toHaveBeenCalledWith('cpu', 0);
    });

    test('should handle hit', () => {
      // Force a ship at position 0
      game.cpuBoard.reset();
      game.cpuBoard.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      game.playerAttack(0);
      
      expect(mockUI.renderHit).toHaveBeenCalledWith('cpu', 0);
    });

    test('should increment hit counter on hit', () => {
      game.cpuBoard.reset();
      game.cpuBoard.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      const initialHits = game.playerHits;
      game.playerAttack(0);
      
      expect(game.playerHits).toBe(initialHits + 1);
    });

    test('should reject duplicate attack', () => {
      game.playerAttack(0);
      mockUI.setMessage.mockClear();
      game.playerAttack(0);
      
      expect(mockUI.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('already fired')
      );
    });

    test('should trigger CPU turn after player attack', () => {
      const spyReceiveAttack = jest.spyOn(game.playerBoard, 'receiveAttack');
      game.playerAttack(0);
      
      expect(spyReceiveAttack).toHaveBeenCalled();
    });

    test('should detect player victory', () => {
      // Manually set up victory condition
      game.cpuBoard.reset();
      game.cpuBoard.placeShip(2, 0, ORIENTATION.HORIZONTAL);
      
      game.playerAttack(0);
      game.playerAttack(1);
      
      expect(mockUI.showVictory).toHaveBeenCalled();
      expect(game.gameStarted).toBe(false);
    });

    test('should not trigger CPU turn after victory', () => {
      game.cpuBoard.reset();
      game.cpuBoard.placeShip(2, 0, ORIENTATION.HORIZONTAL);
      
      const spyCpuTurn = jest.spyOn(game, 'cpuTurn');
      game.playerAttack(0);
      game.playerAttack(1);
      
      // First attack triggers CPU turn, second (victory) should not
      expect(spyCpuTurn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cpuTurn', () => {
    beforeEach(() => {
      game.shipsToPlace = 0;
      game.startGame();
    });

    test('should attack player board', () => {
      const spyReceiveAttack = jest.spyOn(game.playerBoard, 'receiveAttack');
      game.cpuTurn();
      expect(spyReceiveAttack).toHaveBeenCalled();
    });

    test('should render hit on player board', () => {
      game.playerBoard.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      
      // Keep attacking until we hit
      for (let i = 0; i < 10; i++) {
        mockUI.renderHit.mockClear();
        game.cpuTurn();
        if (mockUI.renderHit.mock.calls.length > 0) {
          expect(mockUI.renderHit).toHaveBeenCalledWith('player', expect.any(Number));
          break;
        }
      }
    });

    test('should render miss on player board', () => {
      mockUI.renderMiss.mockClear();
      game.cpuTurn();
      
      if (mockUI.renderMiss.mock.calls.length > 0) {
        expect(mockUI.renderMiss).toHaveBeenCalledWith('player', expect.any(Number));
      }
    });

    test('should increment CPU hit counter on hit', () => {
      game.playerBoard.placeShip(3, 55, ORIENTATION.HORIZONTAL);
      
      // Manually trigger hit
      jest.spyOn(game.ai, 'nextAttack').mockReturnValue(55);
      
      const initialHits = game.cpuHits;
      game.cpuTurn();
      
      expect(game.cpuHits).toBe(initialHits + 1);
    });

    test('should detect CPU victory', () => {
      game.playerBoard.reset();
      game.playerBoard.placeShip(2, 50, ORIENTATION.HORIZONTAL);
      
      jest.spyOn(game.ai, 'nextAttack')
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(51);
      
      game.cpuTurn();
      game.cpuTurn();
      
      expect(mockUI.showDefeat).toHaveBeenCalled();
      expect(game.gameStarted).toBe(false);
    });

    test('should not execute when game not started', () => {
      game.gameStarted = false;
      const spyReceiveAttack = jest.spyOn(game.playerBoard, 'receiveAttack');
      
      game.cpuTurn();
      
      expect(spyReceiveAttack).not.toHaveBeenCalled();
    });

    test('should handle null target from AI', () => {
      jest.spyOn(game.ai, 'nextAttack').mockReturnValue(null);
      
      expect(() => game.cpuTurn()).not.toThrow();
    });
  });

  describe('deployCpuFleet', () => {
    test('should place all required ships', () => {
      game.deployCpuFleet();
      
      const expectedShipCount = SHIP_DEFINITIONS.reduce(
        (total, ship) => total + ship.count,
        0
      );
      expect(game.cpuBoard.ships.length).toBe(expectedShipCount);
    });

    test('should place ships with correct lengths', () => {
      game.deployCpuFleet();
      
      SHIP_DEFINITIONS.forEach(shipDef => {
        const matchingShips = game.cpuBoard.ships.filter(
          ship => ship.length === shipDef.length
        );
        expect(matchingShips.length).toBeGreaterThanOrEqual(shipDef.count);
      });
    });

    test('should reset board before placement', () => {
      game.cpuBoard.placeShip(3, 0, ORIENTATION.HORIZONTAL);
      game.deployCpuFleet();
      
      const expectedShipCount = SHIP_DEFINITIONS.reduce(
        (total, ship) => total + ship.count,
        0
      );
      expect(game.cpuBoard.ships.length).toBe(expectedShipCount);
    });

    test('should reset AI after deployment', () => {
      game.ai.focusQueue.push(1, 2, 3);
      game.deployCpuFleet();
      
      expect(game.ai.focusQueue.length).toBe(0);
    });

    test('should place ships without overlap', () => {
      game.deployCpuFleet();
      
      const allCells = new Set();
      game.cpuBoard.ships.forEach(ship => {
        ship.cells.forEach(cell => {
          expect(allCells.has(cell)).toBe(false);
          allCells.add(cell);
        });
      });
    });
  });

  describe('randomIndex', () => {
    test('should return valid board index', () => {
      const index = game.randomIndex();
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(100);
    });

    test('should return different values over multiple calls', () => {
      const indices = new Set();
      for (let i = 0; i < 50; i++) {
        indices.add(game.randomIndex());
      }
      expect(indices.size).toBeGreaterThan(1);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete game flow', () => {
      // Place all player ships
      game.selectShip(5);
      game.placePlayerShip(0);
      
      game.selectShip(4);
      game.placePlayerShip(10);
      game.placePlayerShip(20);
      
      game.selectShip(3);
      game.placePlayerShip(30);
      
      game.selectShip(2);
      game.placePlayerShip(40);
      
      // Start game
      expect(game.canStartGame()).toBe(true);
      game.startGame();
      expect(game.gameStarted).toBe(true);
      
      // Make an attack
      game.playerAttack(50);
      
      expect(game.cpuBoard.attackedCells.has(50)).toBe(true);
    });

    test('should handle ship placement errors gracefully', () => {
      game.selectShip(3);
      game.placePlayerShip(0);
      
      // Try to place overlapping
      game.selectShip(3);
      game.placePlayerShip(0);
      
      // Should still be in valid state
      expect(game.playerBoard.ships.length).toBe(1);
    });

    test('should maintain game state consistency', () => {
      const initialShipsToPlace = game.shipsToPlace;
      
      game.selectShip(5);
      game.placePlayerShip(0);
      
      expect(game.shipsToPlace).toBe(initialShipsToPlace - 1);
      expect(game.playerBoard.ships.length).toBe(1);
      
      const ship = game.getShipSpec(5);
      expect(ship.remaining).toBe(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle rapid ship selections', () => {
      game.selectShip(5);
      game.selectShip(4);
      game.selectShip(3);
      
      expect(game.selectedShipLength).toBe(3);
    });

    test('should handle placement attempts without selection', () => {
      game.selectedShipLength = 0;
      game.placePlayerShip(0);
      
      expect(game.playerBoard.ships.length).toBe(0);
    });

    test('should handle attacks on invalid indices gracefully', () => {
      game.shipsToPlace = 0;
      game.startGame();
      
      expect(() => game.playerAttack(-1)).not.toThrow();
      expect(() => game.playerAttack(100)).not.toThrow();
    });

    test('should handle preview on boundary cells', () => {
      game.selectShip(3);
      
      expect(() => game.previewPlayerPlacement(0)).not.toThrow();
      expect(() => game.previewPlayerPlacement(99)).not.toThrow();
    });
  });
});