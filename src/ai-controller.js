export class AIController {
  constructor(board) {
    this.board = board;
    this.reset();
  }

  reset() {
    this.focusQueue = [];
    this.focusRegistry = new Set();
  }

  nextAttack() {
    while (this.focusQueue.length) {
      const target = this.focusQueue.shift();
      if (!this.board.hasBeenAttacked(target)) {
        return target;
      }
    }
    return this.board.randomUnattackedIndex();
  }

  handleAttackResult(index, result) {
    if (!result || result.alreadyAttacked) {
      return;
    }

    if (result.hit) {
      this.enqueueNeighbors(index);
      if (result.shipSunk) {
        this.reset();
      }
    }
  }

  enqueueNeighbors(index) {
    const { row, col } = this.board.indexToCoord(index);
    const candidates = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    candidates.forEach((candidate) => {
      if (!this.board.isWithinGrid(candidate.row, candidate.col)) {
        return;
      }
      const neighborIndex = this.board.coordToIndex(
        candidate.row,
        candidate.col
      );
      if (this.focusRegistry.has(neighborIndex)) {
        return;
      }
      this.focusRegistry.add(neighborIndex);
      this.focusQueue.push(neighborIndex);
    });
  }
}
