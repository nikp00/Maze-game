/*
RESOURCE:
  http://weblog.jamisbuck.org/2011/1/24/maze-generation-hunt-and-kill-algorithm
*/

var current, start, end, bug, rEnd, rStart, wave, mazeScale, currentIndex;
var stack = [];
var grid = [];
var curentPath = [];
var solutionPath = [];
var openSet = [];
var closedSet = [];
var offset = 20;
var cellSize = 20;
var canvasSize = 800;
var startDrawing = false;
var lineWidth = 2;
var finished = false;
var init_solve = true;
var startSolve = false;
var canSolve = false;
var solvingFirstTime = true;
var solutionAlgo = -1;

function astar(openSet, closedSet, current, grid, currentIndex) {};

function astarSolution(current) {};

function Cell(i, j) {};

// PRELOADS IMAGE
function preload() {
  bug = loadImage("img/bug.png");
}

function setup() {
  mazeScale = 1440 / screen.height;
  canvasSize = canvasSize / mazeScale;
  cellSize = cellSize / mazeScale;
  frameRate(100);
  cols = floor(canvasSize / cellSize);
  rows = floor(canvasSize / cellSize);
  createCanvas(canvasSize + offset * 2, canvasSize + offset * 2).parent('canvasContainer');


  // CREATES THE GRID
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell); //ADD'S THE CELL TO THE GRID ARRAY
    }
  }
  current = grid[0]; //SETS THE CURRENT CELL TO THE CELL 0

  //CREATES A NEW OSCILLATOR
  wave = new p5.Oscillator();
  wave.setType('triangle');
  wave.amp(.5);

}

function draw() {
  background("black");

  //HIGHLIGHTS THE CELLS THAT ARE IN THE STACK
  if (stack.length > 0) {
    for (let i = 0; i < stack.length; i++) {
      if (solutionAlgo == 1) {
        stack[i].renderInStack(255, 0, 0, 100);
      } else {
        stack[i].renderInStack(0, 150, 0);
      }
    }
  }

  //RENDERS THE GRID OF CELLS
  for (let i = 0; i < grid.length; i++) {
    //IF THE CELL WAS VISITED AND THE MAZE ISNT FINISHED
    if (grid[i].visited && !finished) {
      grid[i].render(255, 255, 255, 100);
    }
    //IF THE MAZE IS FINISHED
    else if (finished) {
      grid[i].render(255, 255, 255, 100);
    }
    //IF THE A* ALGORITHM HAS FOUND THE SOLUTION PATH
    else if (solutionPath.length > 0) {
      grid[i].render(255, 255, 255, 100);
    }
    //IF THE MAZE IS BEING DRAWN
    else {
      grid[i].render(0, 0, 0, 100);
    }
  }

  //RENDERS THE CURRENT PATH BEFORE ITS KILLED
  for (let i = 0; i < curentPath.length; i++) {
    curentPath[i].renderCurentPath(255, 255, 255, 50);
  }

  current.curentCell(); //RENDERS AN IMAGE IN THE CURRENT CELL

  //STOPS THE DRAW() LOOP IF THE MAZE IS SOLVED
  if (canSolve && finished && current.j == end.j && current.i == end.i) {
    finished = false;
    //WHEN USING A* THE CURRECT PATH MUST BE DRAWN
    if (solutionAlgo == 1) {
      astarSolution(current);
      current = end;
    }
    //WHEN USING RANDOM PATHFINDING THE DRAW() LOOP MUST STOP
    else if (solutionAlgo == 0) {
      noLoop();
    }
  }

  //STARTS DRAWING IF THE BUTTON IS PRESSED
  if (startDrawing && !finished) {
    current.visited = true;
    curentPath.push(current);
    wave.freq(100 + (current.i + current.j) * 15);
    var next = current.checkNeighbors();
    //IF THEERE ARE NO AVAILABLE NEIGHBORS IT KILLS THE CURRENT PATH AND HUNTS FOR A NEW AVAILABLE CELL
    if (!next) {
      next = newStart();
    }
    if (next) {
      next.visited = true;
      removeWalls(current, next); //REMOVES THE WALLS OF THE CURRENT AND NEXT CELLS
      current = next;
    }

    //IF THERE ISNT ANYTHING ON THE STACK AND THE NEXT CELL ISNT AVAILABLE IT STOPS THE DRAWING OF THE MAZE
    else {
      current.visited = true;
      wave.stop();
      finished = true;
      document.getElementById('solve').style.visibility = "visible";
      document.getElementById('solve1').style.visibility = "visible";
      start_end(); //GENERATES A RANDOM START CELL IN THE FRIST ROW AND A END CELL IN THE LAST ROW
      current = grid[rStart];
    }
  }

  // IF THE BUTTON WAS PRESSED, IT STARTS SOLVING THE MAZE
  if (startSolve) {
    solve();
    canSolve = true;
    startSolve = false;
    //IF THE SELECTED ALGORITHM IS A*, IT ADDS THE START CELL TO THE OPENSET
    if (solutionAlgo == 1) {
      openSet.push(start);
    }
  }

  //IF THE DRAWING OF THE MAZE IS STOPPED, IT START DRAWING THE SOLUTION
  if (finished) {
    if (solutionAlgo == 0) {
      startDrawing = false;
      var next = current.solveDirection();
      if (next) {
        next.visited = true;
        stack.push(current);
        current = next;
      } else if (stack.length > 0) {
        current.visitedSecondTime = true;
        current = stack.pop();
      }
    } else if (solutionAlgo == 1) {
      startDrawing = false;
      if (openSet.length > 0) {
        current = astar(openSet, closedSet, current, grid);
        stack.push(current);
      }
    }
  }
}


//GETS INDEX OF 1D ARRAY FROM I,J CORDINATES OF A 2D ARRAY
function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}

//REMOVES THE WALLS OF THE CELL
function removeWalls(a, b) {
  var x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x == -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  var y = a.j - b.j;
  if (y == 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y == -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

// GENERATES A RANDOM START IN THE TOP ROW AND A RANDOM END IN THE LAST ROW
function start_end() {
  rStart = floor(random(0, cols));
  rEnd = floor(random(grid.length - cols, grid.length));
  if (rStart == rEnd) {
    start_end();
  }

  grid[rStart].start = true;
  grid[rEnd].end = true;
  grid[rStart].walls[0] = false;
  grid[rEnd].walls[2] = false;

}

//STARTS / STOPS THE DRAWING OF THE MAZE
function drawMaze() {
  if (!startDrawing) {
    startDrawing = true;
    wave.start();
  } else {
    startDrawing = false;
    wave.stop();
  }
}

function solve() {
  //RESETS ALL CELLS
  for (let i = 0; i < grid.length; i++) {
    grid[i].visited = false;
    if (grid[i].start) {
      current = grid[i];
      start = current;
    } else if (grid[i].end) {
      end = grid[i];
    }
  }
  wave = null;
}

//RANDOM PATHFINDING
function solveMaze() {
  if (solvingFirstTime) {
    startSolve = true;
    solvingFirstTime = false;
    solutionAlgo = 0;
  }
}

//A* PATHFINDING ALGORITHM
function solveMaze1() {
  if (solvingFirstTime) {
    startSolve = true;
    solvingFirstTime = false;
    solutionAlgo = 1;
  }
}

//HUNTS A NEW UNVISITED CELL
function newStart() {
  curentPath = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {

      if (!grid[index(i, j)].visited) {
        if (grid[index(i - 1, j)] && grid[index(i - 1, j)].visited) {
          current = grid[index(i - 1, j)];
        } else if (grid[index(i + 1, j)] && grid[index(i + 1, j)].visited) {
          current = grid[index(i + 1, j)];
        } else if (grid[index(i, j - 1)] && grid[index(i, j - 1)].visited) {
          current = grid[index(i, j - 1)];
        } else if (grid[index(i, j + 1)] && grid[index(i, j + 1)].visited) {
          current = grid[index(i, j + 1)];
        }
        return grid[index(i, j)];
      }
    }
  }
}