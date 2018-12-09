function astar(openSet, closedSet, current, grid) {
  current = openSet[0];
  currentIndex = 0;

  for (let i = 0; i < openSet.length; i++) {
    if (openSet[i].f < current.f) {
      current = openSet[i];
      currentIndex = i;
    }
  }

  openSet.splice(currentIndex, 1);
  closedSet.push(current);
  var children = current.solveDirection();
  var childIsInClosedSet = false;

  for (let i = 0; i < children.length; i++) {
    childIsInClosedSet = false;

    for (let j = 0; j < closedSet.length; j++) {
      if (closedSet[j] == children[i]) {
        childIsInClosedSet = true;
        break;
      }
    }

    if (childIsInClosedSet) {
      continue;
    }

    children[i].g = current.g + 1;
    children[i].h = abs(end.i - children[i].i) + (abs(end.j + children[i].j));
    children[i].f = children[i].g + children[i].h;
    children[i].parentCell = current;

    for (let x = 0; x < openSet.length; x++) {
      if (children[i] == openSet[x] && children[i].g > openSet[x]) {
        continue;
      }
    }
    openSet.push(children[i]);
  }
  return current;
}

function astarSolution(current) {
  var path = [];

  while (current) {
    current.visitedSecondTime = true;
    solutionPath.push(current);
    current = current.parentCell;
  }
  return path;
}