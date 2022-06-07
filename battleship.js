// =========== arrays to represent gameboard====================================
var gameBoard = [ 
  [0,1,2,3,4,5,6,7,8,9],
  [10,11,12,13,14,15,16,17,18,19],
  [20,21,22,23,24,25,26,27,28,29],
  [30,31,32,33,34,35,36,37,38,39],     
  [40,41,42,43,44,45,46,47,48,49],
  [50,51,52,53,54,55,56,57,58,59],
  [60,61,62,63,64,65,66,67,68,69],
  [70,71,72,73,74,75,76,77,78,79],
  [80,81,82,83,84,85,86,87,88,89],
  [90,91,92,93,94,95,96,97,98,99]                  
];

var grid = [ 
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,9]        
];

var boardSelection = [ 
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"],
  ["x","x","x","x","x","x","x","x","x","x"]             
];

// ================ Randomizer Functions =======================================
//creates random row number
var randomRow = () => {
  row = Math.floor(Math.random() * 10);
  return row;
}
// creates random column number
var randomColumn = () => {
  column = Math.floor(Math.random() * 10);
  return column;
}
// Randomly determines if ship will be verticle or horizontal
var randomVert = () => {
  random = Math.floor(Math.random() * 2);
  return random;
}

//========= Validation Functions ===============================================
// Checks to see if ship can fit on board.
var checkBoard = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    for (var j = 0; j < gameBoard.length; j++) {
      for (var k = 0; k < gameBoard[j].length; k++) {
        if(ship[i] == gameBoard[j][k] && boardSelection[j][k] == 1) {
          return false;
        }
      }
    }
  }
  //if ship fits, return true
  return true; 
}

//checks to see in random numbers are in bounds for ship
var inBounds = (shipLength, row, column, vert) => {
  var rightBoundary = 10;
  var bottomBoundary = 10;

  if (vert == 0){
    if (grid[row][column] + shipLength > rightBoundary) {
      return false;
    }else {
      return true; 
    }
  } else {
    if (grid[row + shipLength] == undefined) {
      return false;
    } else {
      return true;
    }
  }
  
}

//================= Ship Creation Functions ====================================
//creates verticle ship
var createVertShip = (shipLength, row, column) => {
  var ship = [];
  for (var i = 0; i < shipLength; i++) {
    ship.push(gameBoard[row+i][column]);
  }
  return ship;
}

//creates horizontal ship
var createHorizShip = (shipLength, row, column) => {
  var ship = [];
  for(var i = 0; i < shipLength; i++) {
    ship.push(gameBoard[row][column+i]);
  }
  return ship;
}
  
//Marks Board with 1's to show where ships are to be placed
var markBoard = (ship) => {
  for(var i = 0; i < ship.length; i++) {
    for(var j = 0; j < gameBoard.length; j++) {
      for(var k = 0; k < gameBoard[j].length; k++) {
        if(ship[i] == gameBoard[j][k]) {
          boardSelection[j][k] = 1;
        }
      }
    }
  }
}

//============= Main Ship building function ====================================
//Calls other functions to make sure ship can be built
var buildShip = (shipLength) => {
  //builds ship to users specification
  var shipAvailable = false;
  while(!shipAvailable) {
    var isInBounds = false;
    while(!isInBounds) {
      var row = randomRow();
      var column = randomColumn();
      var vert = randomVert(); 
      isInBounds = inBounds(shipLength, row, column, vert)
    }
    var ship = []
    if (vert == 0) {
      ship = createHorizShip(shipLength, row, column);
    } else if (vert == 1) {
      ship = createVertShip(shipLength, row, column);
    }
  
    //stops loop if ship can be built at location
    shipAvailable = checkBoard(ship);
  }
  //places ships on board
  markBoard(ship);
  return ship;
}

// Ship classes and sizes for game
var battleShip = buildShip(5);
var destroyer1 = buildShip(4);
var destroyer2 = buildShip(4);
var frigate = buildShip(3); 
var patrolCoastal = buildShip(2)

// Displays data of created ship on webpage
var displayShip = (ship) => {
  for(var i = 0; i < ship.length; i++) {
    document.getElementById(ship[i]).innerHTML = "  ";
  }
}

// Displays each ship on webpage
displayShip(battleShip);
displayShip(destroyer1);
displayShip(destroyer2);
displayShip(frigate);
displayShip(patrolCoastal);



//==============  Player Selection  ============================================
// Sets ship size to display when user clicks on ship selection
var shipSize
var selectShip = (size) => {
  shipSize = size;
}

// sets ship to Vertical or horizontal based on what user selects
var horizontal = true;
var vertical = false;
var turnVertical = () => {
  horizontal = false
  vertical = true
}
var turnHorizontal = () => {
  horizontal = true;
  vertical = false;
}

//========== Visual mouseover functions ========================================
var hoverA = (cell) => {
  console.log(cell);
  if(horizontal){
    for(var i = 0; i < shipSize; i++) {
      document.getElementById(cell+i).innerHTML = "<div class='ship'></div>";
    }
  } else if (vertical) {
    for(var i = 0; i < shipSize*100; i += 100) {
      document.getElementById(cell+i).innerHTML = "<div class='ship'></div>";
    }
  }
}

var leave = (cell) => {
  if(horizontal){
    for(var i = 0; i< shipSize; i++){
      document.getElementById(cell+i).innerHTML = "  ";
    }
  } else if (vertical) {
    for(var i = 0; i < shipSize*100; i += 100) {
      document.getElementById(cell+i).innerHTML = "  ";
    }
  }
}