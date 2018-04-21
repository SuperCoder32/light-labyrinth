function keydown(keycode) {
	if (won || lost) {
		return;
	} if (keycode != up && keycode != down && keycode != left && keycode != right) {
		return;
	} if (keycode == up) {
		vy = -3;
	} if (keycode == down) {
		vy = 3;
	} if (keycode == left) {
		vx = -3;
	} if (keycode == right) {
		vx = 3;
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
