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
}




//Game variables
var n = 20, m = 20;
var cellWidth = canvas.width / n, cellHeight = canvas.height / m;
var labyrinth = generateLabyrinth(n, m);
var verEdges = labyrinth.verticalEdges;
var horEdges = labyrinth.horizontalEdges;
var graph = labyrinth.graph;

var segments = [];
function pushSegment(x, y) {
	segments.push(new Segment(
		new Vector(
			start.x * cellWidth,
			start.y * cellHeight
		),
		new Vector (
			end.x * cellWidth,
			end.y * cellHeight
	)));
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


var vx = 0, vy = 0;

var pointsRequired = 0;
var pointTaken = [];
for (var y = 0; y < m; y++) {
	pointTaken[y] = [];
	for (var x = 0; x < n; x++) {
		pointTaken[y][x] = Math.random() * 100 >= 10;
		if (!pointTaken[y][x]) pointsRequired++;
	}
}
var points = 0;




//characters logic
var player = new Character(cellWidth / 2, cellHeight / 2, cellWidth / 4, cellHeight / 4, "#aaaaaa", function () {

	var nextCoords = new Vector(player.x + vx, player.y + vy);
	var adjustedNextCoords = new Vector(nextCoords.x - player.width / 2, nextCoords.y - player.height / 2);

	var canMove = validCoords(adjustedNextCoords, player.width / 2, player.height / 2);

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

		var gridPos = gridCoords(player);
		if (!pointTaken[gridPos.y][gridPos.x]) {
			pointTaken[gridPos.y][gridPos.x] = true;
			points++;
			lightRadius--;
		}

		updatePolygons(lightRadius);
	}
});




var enemy = new Character(0, 0, cellWidth, cellHeight, "#990000");

enemy.move = function () {
	var currNode = this.pathToPlayer[this.nodeIndex];
	currNode = new Vector(currNode.x * cellWidth, currNode.y * cellHeight);
	this.moveTowards();

	var arrived = false;
	if (this.direction == "right") {
		arrived = this.x >= currNode.x;
	} else if (this.direction == "left") {
		arrived = this.x <= currNode.x;
	} else if (this.direction == "down") {
		arrived = this.y >= currNode.y;
	} else if (this.direction == "up") {
		arrived = this.y <= currNode.y;
	}

	if (arrived) {
		this.nodeIndex++;
		if (this.nodeIndex < this.pathToPlayer.length) {
			this.direction = this.getDirection();
		}
	}
	if (this.nodeIndex == this.pathToPlayer.length) {
		this.initialize();
	}
}

enemy.getDirection = function () {
	var currNode = this.pathToPlayer[this.nodeIndex];
	currNode = new Vector(currNode.x * cellWidth, currNode.y * cellHeight);
	if (this.x < currNode.x) {
		return "right";
	} else if (this.x > currNode.x) {
		return "left";
	} else if (this.y < currNode.y) {
		return "down";
	} else if (this.y > currNode.y) {
		return "up";
	}
}

enemy.moveTowards = function (coords) {
	if (this.direction == "right") {
		this.x += this.speed;
	} else if (this.direction == "left") {
		this.x -= this.speed;
	} else if (this.direction == "down") {
		this.y += this.speed;
	}  else if (this.direction == "up") {
		this.y -= this.speed;
	}
}

enemy.initialize = function () {
	var myGridPos = gridCoords(this);
	var playerGridPos = gridCoords(player); 
	this.pathToPlayer = getGraphPath(
		graph,
		new Vector(myGridPos.x, myGridPos.y),
		new Vector(playerGridPos.x, playerGridPos.y)
	);
	this.nodeIndex = 0;
	if (this.pathToPlayer) {
		this.direction = this.getDirection();
	}
}

enemy.speed = 2;
enemy.headStart = 5000;



//Game logic
var chasing = false, won = false, lost = false;
var startTime = (new Date()).getTime();
var countdown = null;

function update() {
	player.move();

	//Countdown
	if ((!chasing) && (!won) && (!lost)) {
		var timeDelta = (new Date()).getTime() - startTime;
		if (timeDelta >= enemy.headStart) {
			enemy.initialize();
			chasing = true;
		}
		if (timeDelta % 1000 <= 100) {
			countdown = enemy.headStart / 1000 - parseInt(timeDelta / 1000);
			if (countdown <= 0) {
				countdown = null;
			}
		}
	}

	//Gameplay
	if (chasing) {
		if (areColliding(enemy.x, enemy.y, enemy.width, enemy.height, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)) {
			lost = true;
			chasing = false;
		}
		if (parseInt(player.x / cellWidth) == n - 1 && parseInt(player.y / cellHeight) == m - 1 
			&& points == pointsRequired) {
			won = true;
			chasing = false;
		}
		if ((!won) && (!lost) && enemy.pathToPlayer) {
			enemy.move();
		}
	}
}




//Helper functions and constants + initialization
function validCoords(coords, width, height) {
	return coords.x >= 0 && coords.x + width < canvas.width && coords.y >= 0 && coords.y + height < canvas.height; 
}

function gridCoords(vec) {
	var newX = parseInt(vec.x / cellWidth);
	var newY = parseInt(vec.y / cellHeight);
	return new Vector(newX, newY);
}

var up = 38, down = 40, left = 37, right = 39;

lightSource = new Vector(
	player.x + player.width / 2,
	player.y + player.height / 2
);

updatePolygons();