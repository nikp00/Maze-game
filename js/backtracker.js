/*
RESOURCE:
  http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking
*/

var current, start, end, bug, rEnd, rStart, wave, mazeScale, currentIndex;
var stack = [];
var grid = [];
var solutionPath = [];
var openSet = [];
var closedSet = [];
var cellSize = 20;
var offset = 20;
var canvasSize = 800;
var startDrawing = false;
var lineWidth = 2;
var finished = false;
var init_solve = true;
var startSolve = false;
var canSolve = false;
var solvingFirstTime = true;
var solutionAlgo = -1;
var skip = false;
var steps;
var correctSteps = 0;

function astar(openSet, closedSet, current, grid) {};

function astarSolution(current) {};

function Cell(i, j) {};

// PRELOADS IMAGE
function preload() {
  bug = loadImage("img/bug.png");
}

function setup() {
  //frameRate(100);
  mazeScale = 1440 / screen.height;
  canvasSize = floor(canvasSize / mazeScale);
  cellSize = floor(cellSize / mazeScale);

  cols = floor(canvasSize / cellSize);
  rows = floor(canvasSize / cellSize);
  createCanvas(canvasSize + offset * 2, canvasSize + offset * 2).parent('canvasContainer');

  // CREATES THE GRID
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
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
  steps++;
  if (!skip) {
    //HIGHLIGHTS THE CELLS THAT ARE IN THE STACK
    for (var j = 0; j < stack.length; j++) {
      if (solutionAlgo == 1) {
        stack[j].renderInStack(255, 0, 0, 100);
      } else if (finished) {
        stack[j].renderInStack(0, 150, 0);
      } else {
        stack[j].renderInStack(255, 255, 255, 80);
      }
    }

    //RENDERS THE GRID OF CELLS
    for (var i = 0; i < grid.length; i++) {
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

    //RENDERS THE SOLUTION OF THE ASTAR ALGORITHM
    for (let i = 0; i < solutionPath.length; i++) {
      solutionPath[i].renderAstarSolution(0, 255, 0, 100);
    }


    current.visited = true; //SETS THE CURRENT CELL TO VISITED
    current.curentCell(); //RENDERS AN IMAGE IN THE CURRENT CELL

    //STOPS THE DRAW() LOOP IF THE MAZE IS SOLVED
    if (canSolve && finished && current.j == end.j && current.i == end.i) {
      finished = false;
      //WHEN USING A* THE CURRECT PATH MUST BE DRAWN
      if (solutionAlgo == 1) {
        path = astarSolution(current);
        current = end;
        correctSteps = solutionPath.length - 1;
        Swal.fire({
          type: 'success',
          title: 'The maze is solved',
          text: 'The algorithm solved the maze with ' + correctSteps + ' steps. But it made ' + steps + ' steps in total.'
        });
      }
      //WHEN USING RANDOM PATHFINDING THE DRAW() LOOP MUST STOP
      else if (solutionAlgo == 0) {
        correctSteps = stack.length - 1;
        Swal.fire({
          type: 'success',
          title: 'The maze is solved',
          text: 'The algorithm solved the maze with ' + correctSteps + ' steps. But it made ' + steps + ' steps in total.'
        });
        noLoop();
      }
    }


    //STARTS DRAWING IF THE BUTTON IS PRESSED
    if (startDrawing && !finished) {
      wave.freq(100 + (current.i + current.j) * 15);
      var next = current.checkNeighbors();
      if (next) {
        next.visited = true;
        stack.push(current); //PUSHES THE CURRENT CELL TO THE STACK
        removeWalls(current, next); //REMOVES THE WALLS OF THE CURRENT AND NEXT CELLS
        current = next;
      }

      //IF THE NEXT CELL ISNT AVAILABLE BUT THERE IS AT LEAST ONE CELL ON THE STACK AND THE SELECTED ALGORITHM FOR THE SOLVING ISNT SELECTED,
      // SETS THE CURRENT CELL TO THE LAST CELL THAT WAS ON THE ON TOP OF THE STACK
      else if (stack.length > 0 && solutionAlgo == -1) {
        current = stack.pop();
      } else if (solutionAlgo == -1) {
        wave.stop();
        finished = true;
        document.getElementById('solve1').style.display = "block";
        document.getElementById('solve').style.display = "block";
        start_end(); //GENERATES A RANDOM START CELL IN THE FRIST ROW AND A END CELL IN THE LAST ROW
        current = grid[rStart];
      }
    }

    // IF THE BUTTON WAS PRESSED, IT STARTS SOLVING THE MAZE
    if (startSolve) {
      steps = 0;
      solve();
      canSolve = true;
      startSolve = false;
      //IF THE SELECTED ALGORITHM IS A*, IT ADDS THE START CELL TO THE OPENSET
      if (solutionAlgo == 1) {
        openSet.push(start);
      }
    }

    //IF THE DRAWING OF THE MAZE IS STOPPED. IT START DRAWING THE SOLUTION
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
    document.getElementById('skip').style.display = "block";
  } else {
    startDrawing = false;
    wave.stop();
    document.getElementById('skip').style.display = "none";
  }
}

function solve() {
  //RESETS ALL CELLS
  for (var i = 0; i < grid.length; i++) {
    grid[i].visited = false;
    if (grid[i].start) {
      current = grid[i];
      start = current;
    } else if (grid[i].end) {
      end = grid[i];
    }
  }
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

function skipDrawing() {
  if (!skip) {
    skip = true;
    skipped();
    document.getElementById('skip').style.display = "none";
  } else {
    skip = false;
  }
}

function skipped() {
  if (startDrawing && !finished) {
    wave.freq(100 + (current.i + current.j) * 15);
    var next = current.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(current); //PUSHES THE CURRENT CELL TO THE STACK
      removeWalls(current, next); //REMOVES THE WALLS OF THE CURRENT AND NEXT CELLS
      current = next;
    }

    //IF THE NEXT CELL ISNT AVAILABLE BUT THERE IS AT LEAST ONE CELL ON THE STACK AND THE SELECTED ALGORITHM FOR THE SOLVING ISNT SELECTED,
    // SETS THE CURRENT CELL TO THE LAST CELL THAT WAS ON THE ON TOP OF THE STACK
    else if (stack.length > 0 && solutionAlgo == -1) {
      current = stack.pop();
    } else if (solutionAlgo == -1) {
      wave.stop();
      finished = true;
      document.getElementById('solve1').style.display = "block";
      document.getElementById('solve').style.display = "block";
      document.getElementById('skip').style.display = "none";
      document.getElementById('draw').style.display = "none";
      start_end(); //GENERATES A RANDOM START CELL IN THE FRIST ROW AND A END CELL IN THE LAST ROW
      current = grid[rStart];
      skip = false;
    }
  }

  if (skip) {
    skipped();
  }
}