'use strict'

function randRange(num) {
	var rand = Math.ceil(Math.random() * num - 1);
	return rand;
}

function shuffle(arr) {
	var res = [];
	while (arr.length > 0) {
		res.push(arr.splice(randRange(arr.length), 1)[0]);
	}
	return res;
}

function generateLabyrinth(n, m) {
	//intializing result edges
	var verticalEdges = [], horizontalEdges = [];
	for (var y = 0; y < m; y++) {
		verticalEdges[y] = [];
		for (var x = 0; x < n - 1; x++) {
			verticalEdges[y][x] = true;
		}
	}
	for (var y = 0; y < m - 1; y++) {
		horizontalEdges[y] = [];
		for (var x = 0; x < n; x++) {
			horizontalEdges[y][x] = true;
		}
	}

	//index of edge(wall) given the 2 cells it's between
	function removeEdge(cell1, cell2) {
		if (Math.abs(cell1.x - cell2.x) == 1) { // => same y
			verticalEdges[cell1.y][Math.min(cell1.x, cell2.x)] = false; 
		} else { // => same x and |y1 - y2| = 1
			horizontalEdges[Math.min(cell1.y, cell2.y)][cell1.x] = false;
		}
	}

	//initializing result graph
	var resGraph = [];
	for (var y = 0; y < m; y++) {
		resGraph[y] = [];
		for (var x = 0; x < n; x++) {
			resGraph[y][x] = {
				neighbours: []
			};
		}
	}

	//add a cell to a graph which describes the path taken by the dfs
	function addConnection(cell1, cell2) {
		resGraph[cell1.y][cell1.x].neighbours.push({
			x: cell2.x,
			y: cell2.y
		});
		resGraph[cell2.y][cell2.x].neighbours.push({
			x: cell1.x,
			y: cell1.y
		});
	}

	//given coordinates of a cell in the grid return a list of its neighbours
	function neighboursOf(pos) {
		var result = [];
		if (pos.x > 0) {
			result.push({
				x: pos.x - 1,
				y: pos.y
			});
		}
		if (pos.x < n - 1) {
			result.push({
				x: pos.x + 1,
				y: pos.y
			});
		}
		if (pos.y > 0) {
			result.push({
				x: pos.x,
				y: pos.y - 1
			});
		}
		if (pos.y < m - 1) {
			result.push({
				x: pos.x,
				y: pos.y + 1
			});
		}
		return result;
	}

	//intializing grid graph
	var visited = [];
	var graph = [];
	for (var y = 0; y < m; y++) {
		visited[y] = [];
		graph[y] = [];
		for (var x = 0; x < n; x++) {
			visited[y][x] = false;
			graph[y][x] = {
				neighbours: neighboursOf({
				x: x,
				y: y
			})};
		}
	}

	//doing dfs
	var toVisit = [{
		x: 0,
		y: 0
	}];
	var currPos, currCell, currNeighbour;

	while (toVisit.length > 0) {
		currPos = toVisit.pop();

		if (visited[currPos.y][currPos.x]) {
			continue;
		}

		visited[currPos.y][currPos.x] = true;

		if (currPos.source) {
			removeEdge(currPos.source, currPos);
			addConnection(currPos.source, currPos);
		}

		currCell = graph[currPos.y][currPos.x];
		currCell.neighbours = shuffle(currCell.neighbours);

		for (var i = 0; i < currCell.neighbours.length; i++) {
			currNeighbour = currCell.neighbours[i];

			if (!visited[currNeighbour.y][currNeighbour.x]) {
				currNeighbour.source = currPos;
				toVisit.push(currNeighbour);
			}
		}
	}

	return {
		verticalEdges: verticalEdges,
		horizontalEdges: horizontalEdges,
		graph: resGraph
	};
}