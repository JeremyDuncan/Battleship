import { UIController } from '../ui-controller.js';

describe('UIController', () => {
  let mockDoc;
  let ui;

  beforeEach(() => {
    // Create mock DOM elements
    mockDoc = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      getElementById: jest.fn(),
    };

    const mockMessageEl = { textContent: '' };
    const mockAnnouncementEl = { innerHTML: '' };
    const mockSelectionWrapper = { remove: jest.fn() };
    const mockHeaderEl = {};
    const mockContainerMain = { classList: { add: jest.fn() } };

    mockDoc.querySelector.mockImplementation((selector) => {
      if (selector === '.message') return mockMessageEl;
      if (selector === '.container-main') return mockContainerMain;
      return null;
    });

    mockDoc.getElementById.mockImplementation((id) => {
      if (id === 'announce') return mockAnnouncementEl;
      if (id === 'remove-on-start') return mockSelectionWrapper;
      if (id === 'header') return mockHeaderEl;
      return null;
    });

    ui = new UIController(mockDoc);
  });

  describe('constructor', () => {
    test('should store document reference', () => {
      expect(ui.doc).toBe(mockDoc);
    });

    test('should query and store message element', () => {
      expect(mockDoc.querySelector).toHaveBeenCalledWith('.message');
      expect(ui.messageEl).toBeDefined();
    });

    test('should query and store announcement element', () => {
      expect(mockDoc.getElementById).toHaveBeenCalledWith('announce');
      expect(ui.announcementEl).toBeDefined();
    });

    test('should initialize with empty previewedCells map', () => {
      expect(ui.previewedCells).toBeInstanceOf(Map);
      expect(ui.previewedCells.size).toBe(0);
    });

    test('should handle missing DOM elements gracefully', () => {
      mockDoc.querySelector.mockReturnValue(null);
      mockDoc.getElementById.mockReturnValue(null);
      
      expect(() => new UIController(mockDoc)).not.toThrow();
    });

    test('should use document as default parameter', () => {
      const uiWithDefault = new UIController();
      expect(uiWithDefault.doc).toBeDefined();
    });
  });

  describe('setMessage', () => {
    test('should set text content of message element', () => {
      ui.setMessage('Test message');
      expect(ui.messageEl.textContent).toBe('Test message');
    });

    test('should handle empty string', () => {
      ui.setMessage('');
      expect(ui.messageEl.textContent).toBe('');
    });

    test('should handle null message', () => {
      ui.setMessage(null);
      expect(ui.messageEl.textContent).toBe('');
    });

    test('should handle undefined message', () => {
      ui.setMessage(undefined);
      expect(ui.messageEl.textContent).toBe('');
    });

    test('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000);
      ui.setMessage(longMessage);
      expect(ui.messageEl.textContent).toBe(longMessage);
    });

    test('should handle special characters', () => {
      const specialMessage = '<script>alert("xss")</script>';
      ui.setMessage(specialMessage);
      expect(ui.messageEl.textContent).toBe(specialMessage);
    });

    test('should do nothing if message element is null', () => {
      ui.messageEl = null;
      expect(() => ui.setMessage('test')).not.toThrow();
    });
  });

  describe('clearMessage', () => {
    test('should clear message text', () => {
      ui.messageEl.textContent = 'Some message';
      ui.clearMessage();
      expect(ui.messageEl.textContent).toBe('');
    });

    test('should be idempotent', () => {
      ui.clearMessage();
      ui.clearMessage();
      expect(ui.messageEl.textContent).toBe('');
    });
  });

  describe('updateShipCount', () => {
    test('should update ship count element', () => {
      const mockCounterEl = { textContent: '' };
      mockDoc.getElementById.mockReturnValue(mockCounterEl);
      
      ui.updateShipCount('Battleship', 2);
      
      expect(mockCounterEl.textContent).toBe(' 2');
    });

    test('should handle zero count', () => {
      const mockCounterEl = { textContent: '' };
      mockDoc.getElementById.mockReturnValue(mockCounterEl);
      
      ui.updateShipCount('Destroyer', 0);
      
      expect(mockCounterEl.textContent).toBe(' 0');
    });

    test('should handle missing element', () => {
      mockDoc.getElementById.mockReturnValue(null);
      
      expect(() => ui.updateShipCount('Invalid', 5)).not.toThrow();
    });

    test('should handle negative count', () => {
      const mockCounterEl = { textContent: '' };
      mockDoc.getElementById.mockReturnValue(mockCounterEl);
      
      ui.updateShipCount('Ship', -1);
      
      expect(mockCounterEl.textContent).toBe(' -1');
    });

    test('should format with leading space', () => {
      const mockCounterEl = { textContent: '' };
      mockDoc.getElementById.mockReturnValue(mockCounterEl);
      
      ui.updateShipCount('Ship', 3);
      
      expect(mockCounterEl.textContent).toMatch(/^ \d+$/);
    });
  });

  describe('prepareForBattle', () => {
    test('should clear placement preview', () => {
      ui.previewedCells.set(0, 'preview-valid');
      const mockSquare = { classList: { remove: jest.fn() } };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.prepareForBattle();
      
      expect(ui.previewedCells.size).toBe(0);
    });

    test('should remove selection wrapper', () => {
      ui.prepareForBattle();
      
      expect(ui.selectionWrapper.remove).toHaveBeenCalled();
    });

    test('should add battle-mode class to container', () => {
      ui.prepareForBattle();
      
      expect(ui.containerMain.classList.add).toHaveBeenCalledWith('battle-mode');
    });

    test('should set selectionWrapper to null after removal', () => {
      ui.prepareForBattle();
      
      expect(ui.selectionWrapper).toBeNull();
    });

    test('should handle missing selectionWrapper', () => {
      ui.selectionWrapper = null;
      
      expect(() => ui.prepareForBattle()).not.toThrow();
    });

    test('should handle missing containerMain', () => {
      ui.containerMain = null;
      
      expect(() => ui.prepareForBattle()).not.toThrow();
    });
  });

  describe('showVictory', () => {
    test('should display victory message', () => {
      ui.showVictory();
      
      expect(ui.announcementEl.innerHTML).toContain('YOU WIN!');
    });

    test('should include retry button', () => {
      ui.showVictory();
      
      expect(ui.announcementEl.innerHTML).toContain('RETRY');
    });

    test('should have onclick handler for retry', () => {
      ui.showVictory();
      
      expect(ui.announcementEl.innerHTML).toContain('location.reload()');
    });

    test('should handle missing announcement element', () => {
      ui.announcementEl = null;
      
      expect(() => ui.showVictory()).not.toThrow();
    });
  });

  describe('showDefeat', () => {
    test('should display defeat message', () => {
      ui.showDefeat();
      
      expect(ui.announcementEl.innerHTML).toContain('YOU LOSE!');
    });

    test('should include retry button', () => {
      ui.showDefeat();
      
      expect(ui.announcementEl.innerHTML).toContain('RETRY');
    });

    test('should have onclick handler for retry', () => {
      ui.showDefeat();
      
      expect(ui.announcementEl.innerHTML).toContain('location.reload()');
    });

    test('should handle missing announcement element', () => {
      ui.announcementEl = null;
      
      expect(() => ui.showDefeat()).not.toThrow();
    });
  });

  describe('clearAnnouncement', () => {
    test('should clear announcement HTML', () => {
      ui.announcementEl.innerHTML = '<span>Test</span>';
      ui.clearAnnouncement();
      
      expect(ui.announcementEl.innerHTML).toBe('');
    });

    test('should handle missing announcement element', () => {
      ui.announcementEl = null;
      
      expect(() => ui.clearAnnouncement()).not.toThrow();
    });

    test('should be idempotent', () => {
      ui.clearAnnouncement();
      ui.clearAnnouncement();
      
      expect(ui.announcementEl.innerHTML).toBe('');
    });
  });

  describe('showPlacementPreview', () => {
    test('should add preview classes to cells', () => {
      const mockSquare = {
        classList: { add: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.showPlacementPreview([0, 1, 2], true);
      
      expect(mockSquare.classList.add).toHaveBeenCalledWith('preview-active', 'preview-valid');
    });

    test('should add invalid class when not valid', () => {
      const mockSquare = {
        classList: { add: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.showPlacementPreview([0, 1], false);
      
      expect(mockSquare.classList.add).toHaveBeenCalledWith('preview-active', 'preview-invalid');
    });

    test('should track previewed cells in map', () => {
      const mockSquare = {
        classList: { add: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.showPlacementPreview([5, 6], true);
      
      expect(ui.previewedCells.has(5)).toBe(true);
      expect(ui.previewedCells.has(6)).toBe(true);
    });

    test('should clear previous preview before showing new', () => {
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.showPlacementPreview([0, 1], true);
      ui.showPlacementPreview([2, 3], true);
      
      expect(ui.previewedCells.size).toBe(2);
    });

    test('should handle null cells array', () => {
      expect(() => ui.showPlacementPreview(null, true)).not.toThrow();
    });

    test('should handle empty cells array', () => {
      expect(() => ui.showPlacementPreview([], true)).not.toThrow();
    });

    test('should skip cells with missing elements', () => {
      mockDoc.getElementById.mockReturnValue(null);
      
      expect(() => ui.showPlacementPreview([0, 1], true)).not.toThrow();
    });
  });

  describe('clearPlacementPreview', () => {
    test('should remove preview classes from cells', () => {
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.previewedCells.set(0, 'preview-valid');
      ui.clearPlacementPreview();
      
      expect(mockSquare.classList.remove).toHaveBeenCalledWith(
        'preview-active',
        'preview-valid',
        'preview-invalid'
      );
    });

    test('should clear previewedCells map', () => {
      ui.previewedCells.set(0, 'preview-valid');
      ui.previewedCells.set(1, 'preview-invalid');
      
      ui.clearPlacementPreview();
      
      expect(ui.previewedCells.size).toBe(0);
    });

    test('should handle empty preview map', () => {
      expect(() => ui.clearPlacementPreview()).not.toThrow();
    });

    test('should be idempotent', () => {
      const mockSquare = {
        classList: { remove: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.previewedCells.set(0, 'preview-valid');
      ui.clearPlacementPreview();
      ui.clearPlacementPreview();
      
      expect(ui.previewedCells.size).toBe(0);
    });
  });

  describe('renderShip', () => {
    test('should render ship on player board', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderShip('player', [0, 1, 2]);
      
      expect(mockSquare.innerHTML).toContain('ship-select');
    });

    test('should render ship on cpu board', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderShip('cpu', [10, 11, 12]);
      
      expect(mockSquare.innerHTML).toContain('ship-select');
    });

    test('should handle empty cells array', () => {
      expect(() => ui.renderShip('player', [])).not.toThrow();
    });
  });

  describe('renderHit', () => {
    test('should render hit marker', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderHit('player', 10);
      
      expect(mockSquare.innerHTML).toContain('ship-hit');
    });

    test('should work for cpu board', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderHit('cpu', 20);
      
      expect(mockSquare.innerHTML).toContain('ship-hit');
    });
  });

  describe('renderMiss', () => {
    test('should render miss marker', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderMiss('player', 15);
      
      expect(mockSquare.innerHTML).toContain('ship-miss');
    });

    test('should work for cpu board', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderMiss('cpu', 25);
      
      expect(mockSquare.innerHTML).toContain('ship-miss');
    });
  });

  describe('renderSquare', () => {
    test('should set innerHTML with correct class', () => {
      const mockSquare = { innerHTML: '' };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.renderSquare('player', 5, 'test-class');
      
      expect(mockSquare.innerHTML).toContain('test-class');
      expect(mockSquare.innerHTML).toContain('<div');
    });

    test('should handle missing element', () => {
      mockDoc.getElementById.mockReturnValue(null);
      
      expect(() => ui.renderSquare('player', 5, 'test')).not.toThrow();
    });
  });

  describe('getSquareElement', () => {
    test('should get element by index for player board', () => {
      const mockSquare = {};
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      const element = ui.getSquareElement('player', 42);
      
      expect(mockDoc.getElementById).toHaveBeenCalledWith('42');
      expect(element).toBe(mockSquare);
    });

    test('should get element with A prefix for cpu board', () => {
      const mockSquare = {};
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      const element = ui.getSquareElement('cpu', 42);
      
      expect(mockDoc.getElementById).toHaveBeenCalledWith('A42');
      expect(element).toBe(mockSquare);
    });

    test('should handle index 0', () => {
      ui.getSquareElement('player', 0);
      expect(mockDoc.getElementById).toHaveBeenCalledWith('0');
      
      ui.getSquareElement('cpu', 0);
      expect(mockDoc.getElementById).toHaveBeenCalledWith('A0');
    });

    test('should handle large indices', () => {
      ui.getSquareElement('player', 99);
      expect(mockDoc.getElementById).toHaveBeenCalledWith('99');
    });

    test('should return null for missing elements', () => {
      mockDoc.getElementById.mockReturnValue(null);
      
      const element = ui.getSquareElement('player', 100);
      
      expect(element).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete game flow UI updates', () => {
      // Setup
      ui.setMessage('Place your ships');
      expect(ui.messageEl.textContent).toBe('Place your ships');
      
      // Show preview
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() },
        innerHTML: ''
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      ui.showPlacementPreview([0, 1, 2], true);
      
      // Clear preview and prepare for battle
      ui.clearPlacementPreview();
      ui.prepareForBattle();
      
      // Show game result
      ui.showVictory();
      expect(ui.announcementEl.innerHTML).toContain('YOU WIN!');
    });

    test('should handle rapid message updates', () => {
      ui.setMessage('Message 1');
      ui.setMessage('Message 2');
      ui.setMessage('Message 3');
      
      expect(ui.messageEl.textContent).toBe('Message 3');
    });

    test('should maintain state across multiple preview cycles', () => {
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() }
      };
      mockDoc.getElementById.mockReturnValue(mockSquare);
      
      ui.showPlacementPreview([0, 1], true);
      ui.clearPlacementPreview();
      ui.showPlacementPreview([5, 6], false);
      ui.clearPlacementPreview();
      
      expect(ui.previewedCells.size).toBe(0);
    });
  });
});