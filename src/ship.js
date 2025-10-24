let shipIdCounter = 1;

export class Ship {
  constructor(length, cells) {
    this.id = `ship-${shipIdCounter++}`;
    this.length = length;
    this.cells = new Set(cells);
    this.hits = new Set();
  }

  occupies(index) {
    return this.cells.has(index);
  }

  recordHit(index) {
    if (this.occupies(index)) {
      this.hits.add(index);
    }
  }

  isSunk() {
    return this.hits.size === this.cells.size;
  }
}
