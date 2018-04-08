'use strict'

function update() {
	
}

var segments = [];

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);

	drawLight();
	context.strokeStyle = "green";
	for (var i=0; i<segments.length; i++) {
		segments[i].draw();
	}

	context.fillStyle = "#aaaa00";
	context.fillRect(
		character.x * cellWidth + (cellWidth - character.width) / 2,
		character.y * cellHeight + (cellHeight -character.height) / 2,
		character.width,
		character.height
	);
}

function keyup(keycode) {
	if (keycode == up || keycode == down || keycode == left || keycode == right) {
		character.vx = 0;
		character.vy = 0;
	}
}

function keydown(keycode) {
	var vx, vy;
	if (keycode == up) {
		vx = 0;
		vy = -1;
	}
	if (keycode == down) {
		vx = 0;
		vy = 1;
	}
	if (keycode == left) {
		vx = -1;
		vy = 0;
	}
	if (keycode == right) {
		vx = 1;
		vy = 0;
	}

	var canMove = false;

	var nextCoords = {
		x: character.x + vx,
		y: character.y + vy
	};
	var edgeInd = getEdgeIndex(character, nextCoords);
	var canMove = validGridCoords(nextCoords) && !labEdges[edgeInd];

	if (canMove) {
		character.x = nextCoords.x;
		character.y = nextCoords.y;
		lightSource = {
			x: (nextCoords.x * cellWidth) + cellWidth / 2,
			y: (nextCoords.y * cellHeight) + cellHeight / 2
		};
		updatePolygons();
	}
}

var n = 20, m = 20;
var cellWidth = canvas.width / n, cellHeight = canvas.height / m;
var character = {
	x: 0,
	y: 0,
	width: cellWidth / 4,
	height: cellHeight / 4
};
var labEdges = generateLabyrinth(n, m);
function getCells(index) {
    var x1, y1, x2, y2;
    if (index < n * (m - 1)) {
        x1 = index % n;
        y1 = Math.floor(index / n);

        x2 = x1;
        y2 = y1 + 1;
    } else {
        index -= n * (m - 1);
        
        x1 = index % (n - 1);
        y1 = Math.floor(index / (n - 1));

        x2 = x1 + 1;
        y2 = y1;
    }
    return [{
        x: x1,
        y: y1
    }, {
        x: x2,
        y: y2
    }];
}

for (var i=0; i<labEdges.length; i++) {
	if (labEdges[i]) {
		var res = getCells(i);
		var start = res[0], end = res[1];

		context.fillStyle = "black";
		if (start.x == end.x - 1) {
			segments.push(new Segment({
				x: end.x * cellWidth,
				y: start.y * cellHeight
			}, {
				x: end.x * cellWidth,
				y: (start.y + 1) * cellHeight
			})); 
		} else {
			segments.push(new Segment({
				x: end.x * cellWidth,
				y: end.y * cellHeight
			}, {
				x: (end.x + 1) * cellWidth,
				y: end.y * cellHeight
			}));
		}
	}
}

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

function validGridCoords(coords) {
	return coords.x >= 0 && coords.x < n && coords.y >= 0 && coords.y < m; 
}

function gridCoords(coords) {
	return {
		x: parseInt((coords.x - 1) / cellWidth),
		y: parseInt((coords.y - 1) / cellHeight),
	}
}

function gridCells(coords, width, height) {
	var upperLeft = gridCoords({
		x: coords.x,
		y: coords.y
	});
	var upperRight = gridCoords({
		x: coords.x + width,
		y: coords.y
	});
	var lowerLeft = gridCoords({
		x: coords.x,
		y: coords.y + height
	});
	var result = {};
	if (upperLeft.x == upperRight.x - 1) {
		return [upperLeft, upperRight];
	}
	if (upperLeft.y == lowerLeft.y - 1) {
		return [upperLeft, lowerLeft];
	}
}

var up = 38, down = 40, left = 37, right = 39;

lightSource = {
	x: (character.x * cellWidth) + cellWidth / 2,
	y: (character.y * cellHeight) + cellHeight / 2
};

updatePolygons();