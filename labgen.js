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
	//index of edge(wall) given the 2 cells it's between
	function getEdgeIndex(cell1, cell2) {
		if (cell1.y == cell2.y - 1) {
			return cell1.y * n + cell1.x;
		}
		if (cell2.y == cell1.y - 1) {
			return cell2.y * n + cell2.x;
		}
		var offset = (n - 1) * m;
		if (cell1.x == cell2.x - 1) {
			return offset + cell1.y * (n - 1) + cell1.x;
		}
		if (cell2.x == cell1.x - 1) {
			return offset + cell2.y * (n - 1) + cell2.x;
		}
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
	for (var y=0; y<m; y++) {
		visited[y] = [];
		graph[y] = [];
		for (var x=0; x<n; x++) {
			visited[y][x] = false;
			graph[y][x] = {
				neighbours: neighboursOf({
				x: x,
				y: y
			})};
		}
	}

	//initializing result edges
	var edges = [], len = (n - 1) * m + (m - 1) * n;
	for (var i=0; i<len; i++) {
		edges[i] = true;
	}

	//doing dfs
	var toVisit = [{
		x: 0,
		y: 0
	}];
	var currPos, currNeighbour;

	while (toVisit.length > 0) {
		currPos = toVisit.pop();

		if (visited[currPos.y][currPos.x]) {
			continue;
		}

		visited[currPos.y][currPos.x] = true;

		if (currPos.source) {
			edges[getEdgeIndex(currPos.source, currPos)] = false;
		}

		graph[currPos.y][currPos.x].neighbours = shuffle(graph[currPos.y][currPos.x].neighbours);
		for (var i=0; i<graph[currPos.y][currPos.x].neighbours.length; i++) {
			currNeighbour = graph[currPos.y][currPos.x].neighbours[i];
			if (!visited[currNeighbour.y][currNeighbour.x]) {
				currNeighbour.source = currPos;
				toVisit.push(currNeighbour);
			}
		}
	}

	return edges;
}