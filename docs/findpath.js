function getGraphPath(graph, start, dest) {
	//intializing visited
	var visited = [];
	for (var y = 0; y < m; y++) {
		visited[y] = [];
		for (var x = 0; x < n; x++) {
			visited[y][x] = false;
		}
	}

	//doing bfs
	var toVisit = [start];
	var found = false;
	var currPos, currCell, currNeighbour;

	while (toVisit.length > 0) {
		currPos = toVisit.pop();

		if (visited[currPos.y][currPos.x]) {
			continue;
		}

		visited[currPos.y][currPos.x] = true;


		if (currPos.x == dest.x && currPos.y == dest.y) {
			found = true;
			break;
		}

		currCell = graph[currPos.y][currPos.x];

		for (var i = 0; i < currCell.neighbours.length; i++) {
			currNeighbour = currCell.neighbours[i];

			if (!visited[currNeighbour.y][currNeighbour.x]) {
				currNeighbour.source = currPos;
				toVisit.unshift(currNeighbour);
			}
		}
	}

	if (!found) {
		return null;
	}

	//initializing path
	var path = [];

	//backtracking
	while (currPos != start) {
		path.unshift({
			x: currPos.x, 
			y: currPos.y
		});
		currPos = currPos.source;
	}

	return (path.length > 0 ? path : null);
}

function test() {
	return getGraphPath(graph, new Vector(0, 0), new Vector(2, 2));
}