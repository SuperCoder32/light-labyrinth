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


function updatePolygonsWrapper() {
	updatePolygons(Math.max(lightRadius, (new Segment(player, enemy)).distance()));
}


//Game initialization
//	Player logic
var player;
function playerMovementFunc() {
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

		updatePolygonsWrapper();
	}
}

//	Enemy logic
var enemy;
function createEnemy() {

	enemy.move = function () {
		var newPos = lerp(
			cellCenterCoords(this.fromNode),
			cellCenterCoords(this.toNode),
			this.progress
		);

		enemy.x = newPos.x - cellWidth / 2;
		enemy.y = newPos.y - cellHeight / 2;

		this.progress += enemy.speed;

		if (this.progress >= 1) {
			this.progress = 0;
			this.nodeIndex++;

			this.fromNode = this.toNode;
			if (this.nodeIndex < this.pathToPlayer.length) {
				this.toNode = this.pathToPlayer[this.nodeIndex];
			} else {
				this.initialize();
			}
		}
	}

	enemy.initialize = function () {
		var myCenterPos = new Vector(this.x + cellWidth / 2, this.y + cellHeight / 2);
		var myGridPos = gridCoords(myCenterPos);
		var playerGridPos = gridCoords(player);

		this.pathToPlayer = getGraphPath(
			graph,
			new Vector(myGridPos.x, myGridPos.y),
			new Vector(playerGridPos.x, playerGridPos.y)
		);

		this.nodeIndex = 0;
		
		//fromNode has the right value after last move
		this.toNode = this.pathToPlayer[0];

		this.progress = 0;
	}

	enemy.fromNode = new Vector(0, 0);
	enemy.speed = enemySpeed;
	enemy.headStart = headStart;
}


//	Basics
var cellWidth, cellHeight, labyrinth, verEdges, horEdges, graph;
var pointsRequired, pointTaken, points;
var lightRadius;
var segments;
function pushSegment(start, end) {
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

var vx, vy; 
var chasing, won, lost;
var countdown;

function initGame() {
	started = false;
	vx = 0, vy = 0; 
	chasing = false, won = false, lost = false;
	countdown = null;

	cellWidth = canvas.width / n, cellHeight = canvas.height / m;
	labyrinth = generateLabyrinth(n, m);
	verEdges = labyrinth.verticalEdges;
	horEdges = labyrinth.horizontalEdges;
	graph = labyrinth.graph;

	segments = [];
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

	pointsRequired = 0;
	pointTaken = [];
	for (var y = 0; y < m; y++) {
		pointTaken[y] = [];
		for (var x = 0; x < n; x++) {
			pointTaken[y][x] = Math.random() * 100 >= coinProb;
			if (!pointTaken[y][x]) pointsRequired++;
		}
	}
	points = 0;

	player = new Character(cellWidth / 2, cellHeight / 2, cellWidth / 4, cellHeight / 4, "#aaaaaa", playerMovementFunc);
	player.speed = playerSpeed * cellWidth;
	enemy = new Character(0, 0, cellWidth, cellHeight, "#990000");
	createEnemy(headStart);

	lightSource = new Vector(
		player.x + player.width / 2,
		player.y + player.height / 2
	);

	lightRadius = canvas.width * lightSpan / n;
	updatePolygonsWrapper();
}






//Game logic
function update() {
	player.move();

	//Countdown
	if ((!chasing) && (!won) && (!lost)) {
		var timeDelta = (new Date()).getTime() - startTime;
		if (timeDelta >= enemy.headStart * 1000) {
			enemy.initialize();
			chasing = true;
		}
		if (timeDelta % 1000 <= 1000) {
			countdown = enemy.headStart - parseInt(timeDelta / 1000);
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

function cellCenterCoords(cell) {
	var newX = cell.x * cellWidth + cellWidth / 2;
	var newY = cell.y * cellHeight + cellHeight / 2;
	return new Vector(newX, newY);
}