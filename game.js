'use strict'

//Classes
class Character {
	constructor(startx, starty, width, height, color, movementFunction) {
		this.x = startx;
		this.y = starty; 
		this.width = width; 
		this.height = height; 
		this.color = color; 
		this.move = movementFunction;
	}

	getUpperLeft() {
		return new Vector(this.x - this.width / 2, this.y - this.height / 2);
	}

	isColliding(ellipse) {
		let upperLeft1 = this.getUpperLeft();
		let upperLeft2 = ellipse.getUpperLeft();

		return areColliding(
			upperLeft1.x,
			upperLeft1.y,
			this.width,
			this.height,
			upperLeft2.x,
			upperLeft2.y,
			upperLeft2.width,
			upperLeft2.height
		);
	}
}



//Game variables
var n = 20, m = 20;
var cellWidth = canvas.width / n, cellHeight = canvas.height / m;
var vx = 0, vy = 0;



//characters logic
var player = new Character(cellWidth / 2, cellHeight / 2, cellWidth / 4, cellHeight / 4, "#aaaa00", function () {

	var nextCoords = new Vector(player.x + vx, player.y + vy);
	var adjustedNextCoords = new Vector(nextCoords.x - player.width / 2, nextCoords.y - player.height / 2);

	var canMove = validCoords(adjustedNextCoords);

	for (var i = 0; i < segments.length && canMove; i++) {
		if (areColliding(adjustedNextCoords.x, adjustedNextCoords.y, player.width, player.height,
		Math.min(segments[i].start.x, segments[i].end.x), Math.min(segments[i].start.y, segments[i].end.y),
		Math.abs(segments[i].start.x - segments[i].end.x), Math.abs(segments[i].start.y - segments[i].end.y))) {
			canMove = false;
		}
	}

	if (canMove) {
		player.x = nextCoords.x;
		player.y = nextCoords.y;
		lightSource = {
			x: player.x,
			y: player.y
		};
		updatePolygons();
	}
});

var enemy = new Character(cellWidth / 2, cellHeight / 4, cellWidth / 4, cellHeight / 4, "#ff0000", function () {
	this.x += 1;
	this.y += 1;
});




//Game logic
var chasing = false;
var startTime = (new Date()).getTime();

function update() {
	player.move();

	if (!chasing && (new Date()).getTime() - startTime >= 5000) {
		chasing = true;
	}

	if (chasing) {
		enemy.move();
	}
}

function keydown(keycode) {
	if (keycode != up && keycode != down && keycode != left && keycode != right) {
		return;
	}

	if (keycode == up) {
		vy = -2;
	}
	if (keycode == down) {
		vy = 2;
	}
	if (keycode == left) {
		vx = -2;
	}
	if (keycode == right) {
		vx = 2;
	}
}

function keyup(keycode) {
	if (keycode == up || keycode == down) {
		vy = 0;
	}
	if (keycode == left || keycode == right) {
		vx = 0;
	}	
}




//Drawing
function draw() {
	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);

	drawLight(canvas.width * 2 / n);
	context.strokeStyle = "green";
	for (var i=0; i<segments.length; i++) {
		segments[i].draw();
	}

	context.fillStyle = player.color;
	context.beginPath();
	context.ellipse(player.x, player.y, player.width / 2, player.height / 2, 0, 0, 2 * Math.PI);
	context.fill();

	context.fillStyle = enemy.color;
	context.beginPath();
	context.ellipse(enemy.x, enemy.y, enemy.width / 2, enemy.height / 2, 0, 0, 2 * Math.PI);
	context.fill();
}




//Labyrinth generation
var edges = generateLabyrinth(n, m);
var verEdges = edges.vertical;
var horEdges = edges.horizontal;

var segments = [];
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




//Helper functions and constants + initialization
function validCoords(coords) {
	return coords.x >= 0 && coords.x < canvas.width && coords.y >= 0 && coords.y < canvas.height; 
}

var up = 38, down = 40, left = 37, right = 39;

lightSource = {
	x: player.x + player.width / 2,
	y: player.y + player.height / 2
};

updatePolygons();