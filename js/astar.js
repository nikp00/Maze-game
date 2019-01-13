/*
RESOURCE:
  https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
*/
// f IS THE TOTAL COST OF THE CELL (NODE)
// g IS THE DISTANCE BETWEEN THE CURRENT CELL AND THE START CELL
// h IS THE HEURISTIC - ESTIMATED DISTANCE FORM THE CURRENT CELL TO END CELL

//HEURISTIC - |end.i - children.i|^2 + |end.j - children.j|^2

function astar(openSet, closedSet, current, grid, currentIndex) {
  current = openSet[0];
  currentIndex = 0;


  //GETS THE CELL WITH THE SMALLEST f VALUE FROM THE OPENSET
  for (let i = 0; i < openSet.length; i++) {
    if (openSet[i].f < current.f) {
      current = openSet[i];
      currentIndex = i;
    }
  }

  //REMOVES THE CURRENT CELL FROM THE OPENSET
  openSet.splice(currentIndex, 1);
  //ADDS THE CURRENT CELL TO THE CLOSEDSET
  closedSet.push(current);
  var children = current.solveDirection();
  var childIsInClosedSet = false;

  for (let i = 0; i < children.length; i++) {
    childIsInClosedSet = false;

    //CEHCKS IF THE THE CHILDREN CELL IS IN THE COLSED SET
    for (let j = 0; j < closedSet.length; j++) {
      if (closedSet[j] == children[i]) {
        childIsInClosedSet = true;
        break;
      }
    }

    if (childIsInClosedSet) {
      continue;
    }

    //CALCULATES THE g,h AND f VALUES FOR THE CHILDREN CELL
    children[i].g = current.g + 1;
    children[i].h = sq(abs(end.i - children[i].i)) + sq((abs(end.j - children[i].j)));
    children[i].f = children[i].g + children[i].h;
    children[i].parentCell = current;

    /*for (let x = 0; x < openSet.length; x++) {
      if (children[i] == openSet[x] && children[i].g > openSet[x].g) {
        continue;
      }
    }*/

    openSet.push(children[i]);

  }
  return current;
}

function astarSolution(current) {
  //ADDS THE CELLS THAT MAKE THE BEST SOLUTION PATH TO THE SOLUTIONPATH
  while (current) {
    current.visitedSecondTime = true;
    solutionPath.push(current);
    current = current.parentCell;
  }
}