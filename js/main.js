var current, start, end, bug;
var cell_size = 50;
var grid = [];
var offset = 20;
var stack = [];
var c_size = 800;
var finishedd = false;
var start_drawing = false;
var lineWidth = 2;
var finished = false;
var start, end;
var init_solve = true
var alpha;

function preload() {
  bug = loadImage("img/bug.png");
}

function setup() {
  frameRate(10);
  cols = floor(c_size / cell_size);
  rows = floor(c_size / cell_size);
  createCanvas(c_size + offset * 2, c_size + offset * 2);
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell);
    }
  }
  current = grid[0];
}

function draw() {

  background("black");
  for (var i = 0; i < grid.length; i++) {
    grid[i].render();
  }

  for (var j = 0; j < stack.length; j++) {
    if (finished) {
      //alpha = 100 + index(current.i, current.j) - index(end.i, end.j);
      console.log(alpha);
      stack[j].renderInStack(255, 255, 0, 90);
    } else {
      stack[j].renderInStack(255, 255, 255, 80);
    }
  }

  current.visited = true;

  current.curentCell();

  if (finished && current.j == end.j && current.i == end.i) {
    finished = false;
    noLoop();
  }
  if (start_drawing && !finished) {
    var next = current.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      finished = true;
    }
  }

  if (finished && init_solve) {
    start_end();
    solve();
  }


  if (finished) {
    start_drawing = false;
    init_solve = false;
    var next = current.solveDirection();
    if (next) {
      next.visited = true;
      stack.push(current);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }

  }

}

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
  this.start = false;
  this.end = false;
  this.ind = index(i, j);


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

  this.render = function() {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;

    stroke(0, 204, 0);
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
    if (this.visited) {
      noStroke();
      fill(0, 0, 0, 50);
      rect(x, y, cell_size, cell_size);
    }
    if (this.start) {
      noStroke();
      fill(0, 255, 0, 50);
      rect(x, y, cell_size, cell_size);
    }
    if (this.end) {
      noStroke();
      fill(255, 0, 0, 50);
      rect(x, y, cell_size, cell_size);
    }
  }

  this.curentCell = function() {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;
    //noStroke();
    //fill(255, 255, 255, 50);
    //rect(x, y, cell_size, cell_size);
    image(bug, x, y, cell_size, cell_size);
  }

  this.renderInStack = function(r, g, b, a) {
    var x = this.i * cell_size + offset;
    var y = this.j * cell_size + offset;
    noStroke();
    fill(r, g, b, a);
    rect(x, y, cell_size, cell_size);

  }
}

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

function start_end() {
  var r_start = floor(random(0, cols));
  var r_end = floor(random(grid.length - cols, grid.length));
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
  } else {
    start_drawing = false;
  }
}

function solve() {
  for (var i = 0; i < grid.length; i++) {
    grid[i].visited = false;
    if (grid[i].start) {
      current = grid[i];
      start = current;
      console.log(grid[i].start);
      console.log(start);
    } else if (grid[i].end) {
      end = grid[i];
    }
  }
}