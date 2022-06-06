// =========== arrays to represent gameboard===================
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

// generates random numbers for row and column on gameboard
// generates number 0-9
var randomRow = () => {
  row = Math.floor(Math.random() * 10);
  return row;
}
var randomColumn = () => {
  column = Math.floor(Math.random() * 10);
  return column;
}

var randomVert = () => {
  random = Math.floor(Math.random() * 2);
  return random;
}


var checkBoard = (ship) => {
  // check board if randomly generated ship fits board
  for (var i = 0; i < ship.length; i++) {
    for (var j = 0; j < gameBoard.length; j++) {
      for (var k = 0; k < gameBoard[j].length; k++) {
        if(ship[i] == gameBoard[j][k] && boardSelection[j][k] == 1) {
          return false;
        }
      }
    }
  }
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

  //creates verticle ship
  var createVertShip = (shipLength, row, column) => {
    var ship = [];
    for (var i = 0; i < shipLength; i++) {
      console.log(i)
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
  

//Marks Board with ships
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


//============= Main Ship building function ================================
//Calls other functions to make sure ship can be built
var buildShip = (shipLength) => {
  //builds ship to users specification
  var shipAvailable = false;
  while(!shipAvailable) {
    var isInBounds = false;
    while(!isInBounds) {
      var row = randomRow();
      var column = randomColumn();
      var vert = randomVert(); //====>>>>>>>>>>>>>>>>>>>>>>>>>>(REMOVE)
      isInBounds = inBounds(shipLength, row, column, vert)
    }
    var ship = []
    if (vert == 0) {
      ship = createHorizShip(shipLength, row, column);
      console.log(ship)
    } else if (vert == 1) {
      ship = createVertShip(shipLength, row, column);
      console.log(ship);
    }
  
    //stops loop if ship can be built at location
    console.log(ship);
    shipAvailable = checkBoard(ship);
  }
  //places ships on board
  markBoard(ship);
  return ship;
}


var battleShip = buildShip(5);
var destroyer1 = buildShip(4);
var destroyer2 = buildShip(4);
var frigate = buildShip(3); 
var patrolCoastal = buildShip(2)

// Displays data of created ship on webpage
var displayShip = (ship) => {
  for(var i = 0; i < ship.length; i++) {
    document.getElementById(ship[i]).innerHTML = "*"
  }
}

displayShip(battleShip);
displayShip(destroyer1);
displayShip(destroyer2);
displayShip(frigate);
displayShip(patrolCoastal);

//     // for (var i = 0; i < battleShip.length; i++) {
//     //   playerShipLocations.push(battleShip[i]);
//     //   document.getElementById(battleShip[i]).innerHTML = "--"