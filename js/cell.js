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

    //IF THE SELECTED ALGORITHM IS RANDOM PATHFINDING, RETURNS A RANDOM CELL FROM THE NEIGHBORS []
    if (solutionAlgo == 0) {
      if (neighbors.length > 0) {
        var r = floor(random(0, neighbors.length));
        return neighbors[r];
      } else {
        return undefined;
      }
    }
    //IF THE SELECTED ALGORITHM IS A* PATHFINDING, RETURNS THE NEIGHBORS []
    else if (solutionAlgo == 1) {
      return neighbors;
    }
  }

  // RENDERS THE CELL
  this.render = function(r, g, b, a) {
    var x = this.i * cellSize + offset;
    var y = this.j * cellSize + offset;

    stroke(r, g, b);
    strokeWeight(lineWidth);
    if (this.walls[0]) {
      line(x, y, x + cellSize, y);
    }
    if (this.walls[1]) {
      line(x + cellSize, y, x + cellSize, y + cellSize);
    }
    if (this.walls[2]) {
      line(x + cellSize, y + cellSize, x, y + cellSize);
    }
    if (this.walls[3]) {
      line(x, y + cellSize, x, y);
    }
    //CHECKS IF THE CELL WAS ALREADY VISITEDS AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.visited) {
      noStroke();
      fill(0, 0, 0, 50);
      rect(x, y, cellSize, cellSize);
    }
    //CHECKS IF THE CELL IS THE START OF THE MAZES AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.start) {
      noStroke();
      fill(0, 255, 0, 100);
      rect(x, y, cellSize, cellSize);
    }
    //CHECKS IF THE CELL IS THE END OF THE MAZES AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.end) {
      noStroke();
      fill(255, 0, 0, 50);
      rect(x, y, cellSize, cellSize);
    }
    //CHECKS IF THE CELL WAS VISITED IN THE ATEMPT OF SOLVING THE MAZE, BUT IS NOT THE CORRECT PATH TO THE END, AND RENDERS IT IN A DIFFERENT COLOUR
    if (this.visitedSecondTime) {
      if (solutionAlgo == 1) {
        noStroke();
        fill(0, 150, 0);
        rect(x, y, cellSize, cellSize);
      } else if (solutionAlgo == 0) {
        noStroke();
        fill(255, 0, 0, 100);
        rect(x, y, cellSize, cellSize);
      }
    }
  }

  // RENDERS AN IMAGE IN THE PLACE OF THE CURRENT CELL
  this.curentCell = function() {
    var x = this.i * cellSize + offset;
    var y = this.j * cellSize + offset;
    image(bug, x, y, cellSize, cellSize);
  }

  //RENDERS THE CELL IN A DIFFERENT COLOUR IF THE CELL IS IN THE STACK
  this.renderInStack = function(r, g, b, a) {
    var x = this.i * cellSize + offset;
    var y = this.j * cellSize + offset;
    noStroke();
    fill(r, g, b, a);
    rect(x, y, cellSize, cellSize);

  }

  //RENDERS THE CURENT PATH IN A DIFFERENT COLOUR BEFOR ITS KILLED
  this.renderCurentPath = function(r, g, b, a) {
    var x = this.i * cellSize + offset;
    var y = this.j * cellSize + offset;
    noStroke();
    fill(r, g, b, a);
    rect(x, y, cellSize, cellSize);
  }
}