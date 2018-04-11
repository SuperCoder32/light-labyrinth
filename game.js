'use strict'

var vx = 0, vy = 0;

function keydown(keycode) {
	if (keycode != up && keycode != down && keycode != left && keycode != right) {
		return;
	}

	if (keycode == up) {
		vx = 0;
		vy = -2;
	}
	if (keycode == down) {
		vx = 0;
		vy = 2;
	}
	if (keycode == left) {
		vx = -2;
		vy = 0;
	}
	if (keycode == right) {
		vx = 2;
		vy = 0;
	}
}

function keyup(keycode) {
	if (keycode == up || keycode == down || keycode == left || keycode == right) {
		vx = 0;
		vy = 0;
	}	
}

function update() {
	var nextCoords = new Vector(character.x + vx, character.y + vy);
	var adjustedNextCoords = new Vector(nextCoords.x - character.width / 2, nextCoords.y - character.height / 2);
	var canMove = validCoords(adjustedNextCoords);

	for (var i = 0; i < segments.length && canMove; i++) {
		if (areColliding(adjustedNextCoords.x, adjustedNextCoords.y, character.width, character.height,
		Math.min(segments[i].start.x, segments[i].end.x), Math.min(segments[i].start.y, segments[i].end.y),
		Math.abs(segments[i].start.x - segments[i].end.x), Math.abs(segments[i].start.y - segments[i].end.y))) {
			canMove = false;
		}
	}

	if (canMove) {
		character.x = nextCoords.x;
		character.y = nextCoords.y;
		lightSource = {
			x: character.x,
			y: character.y
		};
		updatePolygons();
	}
}

var segments = [];

function draw() {
	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);

	drawLight(canvas.width * 2 / n);
	context.strokeStyle = "green";
	for (var i=0; i<segments.length; i++) {
		segments[i].draw();
	}

	context.fillStyle = "#aaaa00";
	context.beginPath();
	context.ellipse(character.x, character.y, character.width / 2, character.height / 2, 0, 0, 2*Math.PI);
	context.fill();
}

var n = 20, m = 20;
var cellWidth = canvas.width / n, cellHeight = canvas.height / m;

var character = {
	x: cellWidth / 2,
	y: cellHeight / 2,
	width: cellWidth / 4,
	height: cellHeight / 4
};
var edges = generateLabyrinth(n, m);
var verEdges = edges.vertical;
var horEdges = edges.horizontal;

function pushSegment(x, y) {
	segments.push(new Segment({
		x: start.x * cellWidth,
		y: start.y * cellHeight
	}, {
		x: end.x * cellWidth,
		y: end.y * cellHeight
	}));
}

for (var y = 0; y < verEdges.length; y++) {
	for (var x = 0; x < verEdges[y].length; x++) {
		if (verEdges[y][x]) {
			var start = new Vector(x + 1, y);
			var end = new Vector(x + 1, y + 1); 
			pushSegment(start, end);
		}
	}
}

for (var y = 0; y < horEdges.length; y++) {
	for (var x = 0; x < horEdges[y].length; x++) {
		if (horEdges[y][x]) {
			var start = new Vector(x, y + 1);
			var end = new Vector(x + 1, y + 1); 
			pushSegment(start, end);
		}
	}
}

function validCoords(coords) {
	return coords.x >= 0 && coords.x < canvas.width && coords.y >= 0 && coords.y < canvas.height; 
}

var up = 38, down = 40, left = 37, right = 39;

lightSource = {
	x: character.x + character.width / 2,
	y: character.y + character.height / 2
};

updatePolygons();