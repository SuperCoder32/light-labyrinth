var lightGradient;

function drawBackground() {
	context.strokeStyle = "black";
	context.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawEnemy() {
	context.fillStyle = "rgba(172, 0, 0, 0.5)";
	var segmentToLight = new Segment(
		new Vector(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2),
		new Vector(lightSource.x, lightSource.y)
	);

	context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

var hlStartTime = null;
function highlightEnemy() {
	/*
	if (enemy.pathToPlayer) {
		if (enemy.nodeIndex == enemy.pathToPlayer.length - 1) {
			hlStartTime = (new Date()).getTime();
		}
	}
	if ((new Date()).getTime() - hlStartTime <= 500) {
		context.strokeStyle = "red";
		context.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);	
	}*/
}

function drawLabyrinth() {
	context.strokeStyle = "white";
	for (var i=0; i<segments.length; i++) {
		segments[i].draw();
	}
}

function drawCoins() {
	context.fillStyle = "rgba(255, 255, 0, 0.6)";
	for (var y = 0; y < m; y++) {
		for (var x = 0; x < n; x++) {
			if (!pointTaken[y][x]) {
				context.beginPath();
				context.arc(x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2, cellWidth / 8, 0, Math.PI * 2);
				context.fill();
			}
		}
	}
}

function drawPlayer() {
	context.fillStyle = player.color;
	context.beginPath();
	context.ellipse(player.x, player.y, player.width / 2, player.height / 2, 0, 0, 2 * Math.PI);
	context.fill();
}

var instr = "Navigate with the arrow keys and collect all the coins and go to the finish.";
function displayInstr() {
	context.font = "18px Arial black";
	context.fillStyle = "white";
	context.fillText(instr, 50, canvas.height / 2 - 150);
}

function drawHUD() {
	context.font = "40px Arial black";
	if (countdown) {
		displayInstr();
		context.font = "40px Arial black";
		context.fillStyle = "orange";
		context.fillText(countdown + "s REMAINING", canvas.width / 2 - 150, canvas.height / 2 - 50);
	} else if (won) {
		context.fillStyle = "green";
		context.fillText("YOU WIN", canvas.width / 2 - 125, canvas.height / 2 - 50);
	} else if (lost) {
		context.fillStyle = "red";
		context.fillText("YOU LOSE", canvas.width / 2 - 125, canvas.height / 2 - 50);
	} else if (started) {
		context.fillStyle = "rgba(0, 0, 255, 0.7)";
		context.fillText(points, canvas.width / 2 - 25, canvas.height / 2 - 25);
	} else {
		displayInstr();
	}

	context.fillStyle = "rgba(0, 255, 0, 0.5)";
	context.fillRect((n - 1) * cellWidth, (m - 1) * cellHeight, cellWidth, cellHeight);
	context.font = "8px Arial black";
	context.fillStyle = "white";
	context.fillText("FINISH", (n - 1) * cellWidth + 5, (m - 1) * cellHeight + cellHeight / 3);
}

function draw() {
	drawBackground();

	lightGradient = createRadialGradient(255, 255, 255, lightRadius);
	drawLight(lightGradient, drawEnemy);

	highlightEnemy();
	drawLabyrinth();
	drawCoins();
	drawPlayer();
	drawHUD();
}