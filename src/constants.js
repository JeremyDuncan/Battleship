export const BOARD_SIZE = 10;

export const SHIP_DEFINITIONS = [
  { name: "Battleship", length: 5, count: 1, counterId: "Battleship" },
  { name: "Destroyer", length: 4, count: 2, counterId: "Destroyer" },
  { name: "Frigate", length: 3, count: 1, counterId: "Frigate" },
  { name: "Patrol Ship", length: 2, count: 1, counterId: "Patrolship" },
];

export const TOTAL_SHIP_CELLS = SHIP_DEFINITIONS.reduce(
  (total, ship) => total + ship.length * ship.count,
  0
);

export const ORIENTATION = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
};
