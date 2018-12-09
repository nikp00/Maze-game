var current, start, end, bug, r_end, r_start, wave, mazeScale, currentIndex;
var stack = [];
var grid = [];
var curentPath = [];
var solutionPath = [];
var openSet = [];
var closedSet = [];
var offset = 20;
var cell_size = 20;
var c_size = 800;
var start_drawing = false;
var lineWidth = 2;
var finished = false;
var init_solve = true;
var startSolve = false;
var canSolve = false;
var solvingFirstTime = true;
var solutionAlgo = -1;

function astar(openSet, closedSet, current, grid) {};

function astarSolution(current) {};

// PRELOADS IMAGE
function preload() {
  bug = loadImage("img/bug.png");
}

function setup() {
  mazeScale = 1440 / screen.height;
  c_size = c_size / mazeScale;
  cell_size = cell_size / mazeScale;
  frameRate(100);
  cols = floor(c_size / cell_size);
  rows = floor(c_size / cell_size);
  createCanvas(c_size + offset * 2, c_size + offset * 2).parent('canvasContainer');


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
    if (grid[i].visited && !finished) {
      grid[i].render(255, 255, 255, 100);
    } else if (finished) {
      grid[i].render(255, 255, 255, 100);
    } else if (solutionPath.length > 0) {
      grid[i].render(255, 255, 255, 100);
    } else {
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
    if (solutionAlgo == 1) {
      path = astarSolution(current);
      current = end;
    } else if (solutionAlgo == 0) {
      noLoop();
    }
  }

  //STARTS DRAWING IF THE BUTTON IS PRESSED
  if (start_drawing && !finished) {
    current.visited = true;
    curentPath.push(current);
    wave.freq(100 + (current.i + current.j) * 15);
    var next = current.checkNeighbors();
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
      start_end();
      current = grid[r_start];
    }
  }

  // IF THE BUTTON WAS PRESSED, IT STARTS THE SOLVING
  if (startSolve) {
    solve();
    canSolve = true;
    startSolve = false;
    if (solutionAlgo == 1) {
      openSet.push(start);
    }
  }

  //IF THE DRAWING OF THE MAZE IS STOPPED, IT START DRAWING THE SOLUTION
  if (finished) {
    if (solutionAlgo == 0) {
      start_drawing = false;
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
      start_drawing = false;
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

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.walls = [true, true, true, true];
  this.visited = false;
  this.visitedSecondTime = false;
  this.start = false;
  this.end = false;
  this.ind = index(i, j);
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.parentCell;

  // CHECKS THE AVAILABLE NEIGHBORS OF THE CELL AND ADDS THE AVAILABLE TO THE NEIGHBORS ARRAY
  this.checkNeighbors = function() {
    var neighbors = [];
    var top = grid[index(i, j - 1)];
    var right = grid[index(i + 1, j)];
    var bottom = grid[index(i, j + 1)];
    var left = grid[index(i - 1, j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }
    if (neighbors.length > 0) {
      var r = floor(random(0, neighbors.length));
      return neighbors[r];

    } else {
      return undefined;
    }
  }

  // CHECKS THE AVAILABLE NEIGHBORS OF THE CELL AND ADDS THE AVAILABLE TO THE NEIGHBORS ARRAY
  this.solveDirection = function() {
    var neighbors = [];
    var top = grid[index(i, j - 1)];
    var right = grid[index(i + 1, j)];
    var bottom = grid[index(i, j + 1)];
    var left = grid[index(i - 1, j)];

    if (top && !top.visited && !this.walls[0]) {
      neighbors.push(top);
    }
    if (right && !right.visited && !this.walls[1]) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited && !this.walls[2]) {
      neighbors.push(bottom);
    }
    if (left && !left.visited && !this.walls[3]) {
      neighbors.push(left);
    }
    if (solutionAlgo == 0) {
      if (neighbors.length > 0) {
        var r = floor(random(0, neighbors.length));
        return neighbors[r];
      } else {
        return undefined;
      }
    } else if (solutionAlgo == 1) {
      return neighbors;
    }
  }

  // RENDERS THE CELL
  this.render = function(r, g, b, a) {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;

    stroke(r, g, b);
    strokeWeight(lineWidth);
    if (this.walls[0]) {
      line(x, y, x + cell_size, y);
    }
    if (this.walls[1]) {
      line(x + cell_size, y, x + cell_size, y + cell_size);
    }
    if (this.walls[2]) {
      line(x + cell_size, y + cell_size, x, y + cell_size);
    }
    if (this.walls[3]) {
      line(x, y + cell_size, x, y);
    }
    //CHECKS IF THE CELL WAS ALREADY VISITEDS AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.visited) {
      noStroke();
      fill(0, 0, 0, 50);
      rect(x, y, cell_size, cell_size);
    }
    //CHECKS IF THE CELL IS THE START OF THE MAZES AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.start) {
      noStroke();
      fill(0, 255, 0, 100);
      rect(x, y, cell_size, cell_size);
    }
    //CHECKS IF THE CELL IS THE END OF THE MAZES AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.end) {
      noStroke();
      fill(255, 0, 0, 50);
      rect(x, y, cell_size, cell_size);
    }
    //CHECKS IF THE CELL WAS VISITED IN THE ATEMPT OF SOLVING THE MAZE, BUT IS NOT THE CORRECT PATH TO THE END, AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.visitedSecondTime) {
      if (solutionAlgo == 1) {
        noStroke();
        fill(0, 150, 0);
        rect(x, y, cell_size, cell_size);
      } else if (solutionAlgo == 0) {
        noStroke();
        fill(255, 0, 0, 100);
        rect(x, y, cell_size, cell_size);
      }
    }
  }

  // RENDERS AN IMAGE IN THE PLACE OF THE CURRENT CELL
  this.curentCell = function() {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;
    image(bug, x, y, cell_size, cell_size);
  }

  //RENDERS THE CELL IN A DIFFERENT COLOUR IF THE CELL IS IN THE STACK
  this.renderInStack = function(r, g, b, a) {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;
    noStroke();
    fill(r, g, b, a);
    rect(x, y, cell_size, cell_size);

  }

  //RENDERS THE CURENT PATH IN A DIFFERENT COLOUR BEFOR ITS KILLED
  this.renderCurentPath = function(r, g, b, a) {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;
    noStroke();
    fill(r, g, b, a);
    rect(x, y, cell_size, cell_size);
  }
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
  r_start = floor(random(0, cols));
  r_end = floor(random(grid.length - cols, grid.length));
  if (r_start == r_end) {
    start_end();
  }

  grid[r_start].start = true;
  grid[r_end].end = true;
  grid[r_start].walls[0] = false;
  grid[r_end].walls[2] = false;

}

function drawMaze() {
  if (!start_drawing) {
    start_drawing = true;
    wave.start();
  } else {
    start_drawing = false;
    wave.stop();
  }
}

function solve() {
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

function solveMaze() {
  if (solvingFirstTime) {
    startSolve = true;
    solvingFirstTime = false;
    solutionAlgo = 0;
  }
}

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