var current, start, end, bug, r_end, r_start, wave;
var stack = [];
var grid = [];
var cell_size = 20;
var offset = 20;
var c_size = 800;
var start_drawing = false;
var lineWidth = 2;
var finished = false;
var init_solve = true;
var startSolve = false;
var canSolve = false;
var solvingFirstTime = true;

// PRELOADS IMAGE
function preload() {
  bug = loadImage("img/bug.png");
}

function setup() {
  frameRate(100);
  cols = floor(c_size / cell_size);
  rows = floor(c_size / cell_size);
  createCanvas(c_size + offset * 2, c_size + offset * 2);

  // CREATES THE GRID
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell); //ADD'S THE CELL TO THE GRID ARRAY
    }
  }
  current = grid[0]; //SETS THE CURRENT CELL TO THE CELL 0

  wave = new p5.Oscillator();
  wave.setType('triangle');
  wave.amp(.5);
}

function draw() {
  background("black");

  //RENDERS THE GRID OF CELLS
  for (var i = 0; i < grid.length; i++) {
    if (grid[i].visited && !finished) {
      grid[i].render(255, 255, 255, 100);
    } else if (finished) {
      grid[i].render(255, 255, 255, 100);
    } else {
      grid[i].render(0, 0, 0, 100);
    }

  }

  //HIGHLIGHTS THE CELLS THAT ARE IN THE STACK
  for (var j = 0; j < stack.length; j++) {
    if (finished) {
      stack[j].renderInStack(0, 255, 0, 90);
    } else {
      stack[j].renderInStack(255, 255, 255, 80);
    }
  }

  current.visited = true; //SETS THE CURRENT CELL TO VISITED

  current.curentCell(); //RENDERS AN IMAGE IN THE CURRENT CELL

  //STOPS THE DRAW() LOOP IF THE MAZE IS SOLVED
  if (canSolve && finished && current.j == end.j && current.i == end.i) {
    finished = false;
    noLoop();
  }

  //STARTS DRAWING IF THE BUTTON IS PRESSED
  if (start_drawing && !finished) {

    wave.freq(100 + (current.i + current.j) * 15);

    var next = current.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(current); //PUSHES THE CURRENT CELL TO THE STACK
      removeWalls(current, next); //REMOVES THE WALLS OF THE CURRENT AND NEXT CELLS
      current = next;
    }
    //IF THE NEXT CELL ISNT AVAILABLE AND THE THERE IS AT LEAST A CELL ON THE STACK, SETS THE CURRENT CELL TO THE LAST CELL THAT WAS ON THE ON TOP OF THE STACK
    else if (stack.length > 0) {
      current = stack.pop();
    }
    //IF THERE ISNT ANYTHING ON THE STACK AND THE NEXT CELL ISNT AVAILABLE IT STOPS THE DRAWING OF THE MAZE
    else {
      wave.stop();
      finished = true;
      document.getElementById('solve').style.visibility = "visible";
      start_end();
      current = grid[r_start];
    }
  }

  // IF THE BUTTON WAS PRESSED IT STARTS THE SOLVING
  if (startSolve) {
    solve();
    canSolve = true;
    startSolve = false;
  }

  //IF THE DRAWING OF THE MAZE IS STOPPED. IT START DRAWING THE SOLUTION
  if (finished) {
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
    if (neighbors.length > 0) {
      var r = floor(random(0, neighbors.length));
      return neighbors[r];

    } else {
      return undefined;
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
      fill(0, 255, 0, 50);
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
      noStroke();
      fill(200, 0, 0, );
      rect(x, y, cell_size, cell_size);
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

function solveMaze() {
  if (solvingFirstTime) {
    startSolve = true;
  }
}