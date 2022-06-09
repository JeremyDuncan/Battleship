var gameStart = false;

// =========== arrays to represent gameboard====================================
var gameBoard = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
  [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
  [50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
  [60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
  [70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
  [80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
  [90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
];

var grid = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
];

var cpuBoardSelection = [
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
];

var playerBoardSelection = [
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
];

var attackLog = [
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
];

// ================ Randomizer Functions for Computer ==========================
//creates random row number
var randomRow = () => {
  row = Math.floor(Math.random() * 10);
  return row;
};
// creates random column number
var randomColumn = () => {
  column = Math.floor(Math.random() * 10);
  return column;
};
// Randomly determines if ship will be verticle or horizontal
var randomVert = () => {
  random = Math.floor(Math.random() * 2);
  if (random == 0) {
    return false;
  } else {
    return true;
  }
};

//========= Validation Functions ===============================================
// Checks to see if ship can fit on board.
var checkBoard = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    for (var j = 0; j < gameBoard.length; j++) {
      for (var k = 0; k < gameBoard[j].length; k++) {
        if (ship[i] == gameBoard[j][k] && cpuBoardSelection[j][k] == 1) {
          return false;
        }
      }
    }
  }
  //if ship fits, return true
  return true;
};

//checks to see in random numbers are in bounds for ship
var inBounds = (shipLength, row, column, vert) => {
  var rightBoundary = 10;
  var bottomBoundary = 10;

  if (!vert) {
    if (grid[row][column] + shipLength > rightBoundary) {
      return false;
    } else {
      return true;
    }
  } else {
    if (grid[row + shipLength] == undefined) {
      return false;
    } else {
      return true;
    }
  }
};

//================= Ship Creation Functions ====================================
//creates verticle ship
var createVertShip = (shipLength, row, column) => {
  var ship = [];
  for (var i = 0; i < shipLength; i++) {
    ship.push(gameBoard[row + i][column]);
  }
  return ship;
};

//creates horizontal ship
var createHorizShip = (shipLength, row, column) => {
  var ship = [];
  for (var i = 0; i < shipLength; i++) {
    ship.push(gameBoard[row][column + i]);
  }
  return ship;
};

//Marks Board with 1's to show where ships are to be placed
var markBoard = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    for (var j = 0; j < gameBoard.length; j++) {
      for (var k = 0; k < gameBoard[j].length; k++) {
        if (ship[i] == gameBoard[j][k]) {
          cpuBoardSelection[j][k] = 1;
        }
      }
    }
  }
};

//============= CPU Ship building function =====================================
//Calls other functions to make sure ship can be built
var cpuBuildShip = (shipLength) => {
  //builds ship to users specification
  var shipAvailable = false;
  while (!shipAvailable) {
    var isInBounds = false;
    while (!isInBounds) {
      var row = randomRow();
      var column = randomColumn();
      var vert = randomVert();
      isInBounds = inBounds(shipLength, row, column, vert);
    }
    var ship = [];
    if (!vert) {
      ship = createHorizShip(shipLength, row, column);
    } else if (vert) {
      ship = createVertShip(shipLength, row, column);
    }

    //stops loop if ship can be built at location
    shipAvailable = checkBoard(ship);
  }
  //places ships on board
  markBoard(ship);
  return ship;
};

// Displays data of CPU's created ship on webpage
var cpuDisplayShip = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    document.getElementById("A" + ship[i]).innerHTML =
      "<div class='ship-select'></div>";
  }
};

// ========= Player Ship Building Functions ====================================
// Displays data of CPU's created ship on webpage
var playerDisplayShip = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    document.getElementById(ship[i]).innerHTML =
      "<div class='ship-select'></div>";
  }
};

//Marks Board with 1's to show where ships are to be placed
var markPlayerBoard = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    for (var j = 0; j < gameBoard.length; j++) {
      for (var k = 0; k < gameBoard[j].length; k++) {
        if (ship[i] == gameBoard[j][k]) {
          playerBoardSelection[j][k] = 1;
        }
      }
    }
  }
};

// Checks player's board
var checkPlayerBoard = (ship) => {
  for (var i = 0; i < ship.length; i++) {
    for (var j = 0; j < gameBoard.length; j++) {
      for (var k = 0; k < gameBoard[j].length; k++) {
        if (ship[i] == gameBoard[j][k] && playerBoardSelection[j][k] == 1) {
          return false;
        }
      }
    }
  }
  //if ship fits, return true
  return true;
};

// finds row of player click on board
locateBoardRow = (id) => {
  for (var i = 0; i < gameBoard.length; i++) {
    for (var j = 0; j < gameBoard[i].length; j++) {
      if (id == gameBoard[i][j]) {
        console.log("i = " + i);
        return i;
      }
    }
  }
};

// finds column of player click on board
locateBoardColumn = (id) => {
  for (var i = 0; i < gameBoard.length; i++) {
    for (var j = 0; j < gameBoard[i].length; j++) {
      if (id == gameBoard[i][j]) {
        console.log("j = " + i);
        return j;
      }
    }
  }
};

// detects if player's ship is completely on the board
var playerInBounds = (shipLength, row, column, vert) => {
  var rightBoundary = 10;
  var bottomBoundary = 10;

  if (!vert) {
    if (grid[row][column] + shipLength > rightBoundary) {
      return false;
    } else {
      return true;
    }
  } else {
    if (grid[row] + shipLength == undefined) {
      // Investigate further
      return false;
    } else {
      return true;
    }
  }
};

// builds player's ship
var playerBuildShip = (shipLength, id) => {
  if (shipLength > 0) {
    //builds ship to users specification
    var shipAvailable = false;
    var isInBounds = false;
    var ship = [];

    var row = locateBoardRow(id);
    var column = locateBoardColumn(id);

    if (!vert) {
      ship = createHorizShip(shipLength, row, column);
    } else if (vert) {
      ship = createVertShip(shipLength, row, column);
    }

    //checks to see if ship is in bounds and available to place on board
    shipAvailable = checkPlayerBoard(ship);
    isInBounds = playerInBounds(shipLength, row, column, vert);

    if (shipAvailable && isInBounds) {
      //places ships on board
      markPlayerBoard(ship);
      return ship;
    } else {
      alert("Ship out of bounds!");
    }
  }
};

var playerHits = 0;
var cpuHits = 0;
// checks player missile strike location for ship presence
// notifies player of direct hit if ship present, changes logical board marker
// at location from 1 to 0, notifies player if he has already fired missile at location.
var checkIfDirectHit = (id) => {
  for (var i = 0; i < gameBoard.length; i++) {
    for (var j = 0; j < gameBoard[i].length; j++) {
      if (id == gameBoard[i][j] && cpuBoardSelection[i][j] == 1) {
        cpuBoardSelection[i][j] = 0;
        document.getElementById("A" + id).innerHTML =
          "<div class='ship-hit'></div>";
        return true;
      } else if (id == gameBoard[i][j] && cpuBoardSelection[i][j] == 0) {
        alert("You already hit here!!!");
      } else {
        document.getElementById("A" + id).innerHTML =
          "<div class='ship-miss'></div>";
      }
    }
  }
};

// Randomized CPU Attack after Player attacks.
var cpuAttack = () => {
  // Notifies player they lost
  if (cpuHits == 15) {
    alert("YOU LOSE!!!");
    cpuHits++;
    gameStart = false;
  }
  // Stops CPU from attacking
  if (cpuHits > 15 || !gameStart) {
    clearInterval(cpuDirectHit);
  }

  var continueAttack = true;
  while (continueAttack) {
    var row = randomRow();
    var column = randomColumn();
    if (attackLog[row][column] == "x") {
      continueAttack = false;
    }
  }

  attackLog[row][column] = 0;
  var attackVector = gameBoard[row][column];
  for (var i = 0; i < gameBoard.length; i++) {
    for (var j = 0; j < gameBoard[i].length; j++) {
      if (attackVector == gameBoard[i][j] && playerBoardSelection[i][j] == 1) {
        playerBoardSelection[i][j] = 0;
        document.getElementById(attackVector).innerHTML =
          "<div class='ship-hit'></div>";
        cpuHits++;
        return true;
      } else {
        document.getElementById(attackVector).innerHTML =
          "<div class='ship-miss'></div>";
      }
    }
  }
};

//==============  Mouse Click Functions  =======================================
//=============== ATTTAAAAAAACCCCKKKKK!!!!!! ===================
// when player clicks on CPU board
var clickCpuBoard = (id) => {
  if (gameStart) {
    var directHit = false;

    // PLAYER Attack ====
    directHit = checkIfDirectHit(id);

    if (directHit) {
      playerHits += 1;
    }

    if (playerHits >= 15) {
      alert("gameover, You WIN!");
      gameStart = false;
    }
  } else {
    alert("Game has not started");
  }
};

var startCpuAttack = () => {
  // CPU Attack ====
  //Starts a timed interval of attack from CPU
  var cpuDirectHit = setInterval(cpuAttack, 400);
};

// Sets ship size to display when user clicks on ship selection
var shipSize = 0;
var selectShip = (size) => {
  shipSize = size;
};

// sets ship to Vertical or horizontal based on what user selects
var vert = false;
var turnVertical = () => {
  vert = true;
};

var turnHorizontal = () => {
  vert = false;
};

// Keep track of ships placed
var shipCount = 5;

// reduces ship count by 1 when called
var reduceShipCount = () => {
  shipCount--;
};

// alerts user all ships have been placed...and prevents more from being placed
var checkShipCount = () => {
  if (shipCount <= 0) {
    alert("You have placed all ships. Click on Start Game.");
    return false;
  } else {
    return true;
  }
};



//========= Player Ship Count Functions ==========
// Sets the limit for amount ships player can have
var playerBattleship = 1;
var playerDestroyer = 2;
var playerFrigate = 1;
var playerCoastalShip = 1;

// Reduces available number of ships when player places one on board
// Notifies player when all of a ship class has been placed on board.
var isShipAvailable = (shipSize) => {
    if(shipSize == 5) {
      if (playerBattleship > 0) {
        playerBattleship--;
        return true;
      } else {
        alert("All Battleships placed on board. Select a different ship.");
      } 
    } else if (shipSize == 4) {
      if (playerDestroyer > 0) {
        playerDestroyer--;
        return true;
      } else {
        alert("All Destroyers placed on board. Select a different ship.");
      } 
    } else if (shipSize == 3) {
      if (playerFrigate > 0) {
        playerFrigate--;
        return true;
      } else {
        alert("All Frigates placed on board. Select a different ship.");
      } 
    } else if (shipSize == 2) {
      if (playerCoastalShip > 0) {
        playerCoastalShip--;
        return true;
      } else {
        alert("All Patrol Coastal Ships placed on board. Select a different ship.");
      } 
    }
}


// Click event that initializes selection functions
var clickTarget = (id) => {
  // checks if there are ships to place
  var playerSelect = checkShipCount();

  // if ships can be placed, player can place ship..
  if (playerSelect) {
    // returns true if ship is available
    shipAvailable = isShipAvailable(shipSize)
    if(shipAvailable){
      var playerShip = playerBuildShip(shipSize, id);
    }
  }

  //displays ship on board
  playerDisplayShip(playerShip);

  // lower ship count by one
  reduceShipCount();
};

// ===================== Start Game ============================================

// When player selects start, this generates the cpu's ships on the cpu board
var clickStartGame = () => {
  if (shipCount <= 0) {
    gameStart = true;

    //clear the selection screen
    document.getElementById("remove-on-start").innerHTML = "";
    document.getElementById("header").innerHTML = "";
    var elements = document.getElementsByClassName("label");
    for (var i = 0, length = elements.length; i < length; i++) {
      elements[i].innerHTML = "";
    }

    //generates the CPU's ships on logical board
    var battleShip = cpuBuildShip(3);
    var destroyer1 = cpuBuildShip(3);
    var destroyer2 = cpuBuildShip(3);
    var frigate = cpuBuildShip(3);
    var patrolCoastal = cpuBuildShip(3);

    // initializes CPU attacks
    startCpuAttack();

    // displays ships on visual board
    // cpuDisplayShip(battleShip);
    // cpuDisplayShip(destroyer1);
    // cpuDisplayShip(destroyer2);
    // cpuDisplayShip(frigate);
    // cpuDisplayShip(patrolCoastal);
  } else {
    alert("Select your ship location's first");
  }
};
