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
}



//Game variables
var n = 20, m = 20;
var cellWidth = canvas.width / n, cellHeight = canvas.height / m;
var vx = 0, vy = 0;



//characters logic
var player = new Character(cellWidth / 2, cellHeight / 2, cellWidth / 4, cellHeight / 4, "#aa0000", function () {

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

		var lightRadius = canvas.width * 4 / n;
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

enemy.speed = 2;
enemy.headStart = 5000;

enemy.initialize = function () {
	this.pathToPlayer = getGraphPath(
		graph,
		new Vector(parseInt(this.x / cellWidth), parseInt(this.y / cellHeight)),
		new Vector(parseInt(player.x / cellWidth), parseInt(player.y / cellHeight))
	);
	this.nodeIndex = 0;
	if (this.pathToPlayer) {
		this.direction = this.getDirection();
	}
}



//Game logic
var chasing = false, won = false, lost = false;
var startTime = (new Date()).getTime();
var countdown = null;

function update() {
	player.move();

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

	if (chasing) {
		/*if ((new Date()).getTime() - startTime == 5000) {
			enemy.initialize();
		}*/
		if (areColliding(enemy.x, enemy.y, enemy.width, enemy.height, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)) {
			lost = true;
			chasing = false;
		}
		if (parseInt(player.x / cellWidth) == n - 1 && parseInt(player.y / cellHeight) == m - 1) {
			won = true;
			chasing = false;
		}
		if ((!won) && (!lost) && enemy.pathToPlayer) {
			enemy.move();
		}
	}
}

function keydown(keycode) {
	if (won || lost) {
		return;
	} if (keycode != up && keycode != down && keycode != left && keycode != right) {
		return;
	} if (keycode == up) {
		vy = -2;
	} if (keycode == down) {
		vy = 2;
	} if (keycode == left) {
		vx = -2;
	} if (keycode == right) {
		vx = 2;
	}
}

function keyup(keycode) {
	if (keycode == up || keycode == down) {
		vy = 0;
	} if (keycode == left || keycode == right) {
		vx = 0;
	}	
}

if (isMobile) {
	function mousedown() {
		var dir = new Vector(mouseX - player.x, mouseY - player.y);
		var newVx = 0, newVy = 0;
		if (dir.x != 0) {
			if (dir.x > 0) {
				newVx = 2;
			} else if (dir.x < 0) {
				newVx = -2;
			}
			newVy = newVx * dir.y / dir.x;
		} else if (dir.y != 0) {
			if (dir.y > 0) {
				newVy = 2;
			} else if (dir.y < 0) {
				newVy = -2;
			}
			newVx = newVy * dir.x / dir.y;
		}
		vx = newVx;
		vy = newVy;
	}
	function mouseup() {
		vx = 0;
		vy = 0;
	}
}


//Drawing
function draw() {
	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);

	var lightRadius = canvas.width * 4 / n;
	drawLight(lightRadius, 255, 0, 0, function () {
		context.fillStyle = enemy.color;
		var segmentToLight = new Segment(
			new Vector(enemy.x, enemy.y),
			new Vector(lightSource.x, lightSource.y)
		);

		context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

		context.globalAlpha = 1;
	});
	if (((new Date()).getTime() - startTime) % 5000 <= 2000) {
		context.strokeStyle = "white";
		context.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);	
	}

	context.strokeStyle = "green";
	for (var i=0; i<segments.length; i++) {
		segments[i].draw();
	}

	context.fillStyle = player.color;
	context.beginPath();
	context.ellipse(player.x, player.y, player.width / 2, player.height / 2, 0, 0, 2 * Math.PI);
	context.fill();

	context.font = "40px Arial black";
	if (countdown) {
		context.fillStyle = "orange";
		context.fillText(countdown + "s REMAINING", canvas.width / 2 - 150, canvas.height / 2 - 50);
	}
	if (won) {
		context.fillStyle = "green";
		context.fillText("YOU WIN", canvas.width / 2 - 125, canvas.height / 2 - 50);
	}
	if (lost) {
		context.fillStyle = "red";
		context.fillText("YOU LOSE", canvas.width / 2 - 125, canvas.height / 2 - 50);
	}

	context.fillStyle = "rgba(0, 255, 0, 0.5)";
	context.fillRect((n - 1) * cellWidth, (m - 1) * cellHeight, cellWidth, cellHeight);
	context.font = "8px Arial black";
	context.fillStyle = "white";
	context.fillText("FINISH", (n - 1) * cellWidth + 5, (m - 1) * cellHeight + cellHeight / 3);
}




//Labyrinth generation
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




//Helper functions and constants + initialization
function validCoords(coords, width, height) {
	return coords.x >= 0 && coords.x + width < canvas.width && coords.y >= 0 && coords.y + height < canvas.height; 
}

var up = 38, down = 40, left = 37, right = 39;

lightSource = new Vector(
	player.x + player.width / 2,
	player.y + player.height / 2
);

updatePolygons();