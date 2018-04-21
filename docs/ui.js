var up = 38, down = 40, left = 37, right = 39;

function keydown(keycode) {
	if (won || lost) {
		return;
	} if (keycode != up && keycode != down && keycode != left && keycode != right) {
		return;
	} if (keycode == up) {
		vy = -player.speed;
	} if (keycode == down) {
		vy = player.speed;
	} if (keycode == left) {
		vx = -player.speed;
	} if (keycode == right) {
		vx = player.speed;
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
