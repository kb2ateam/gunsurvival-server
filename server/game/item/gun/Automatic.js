import randomNormal from "random-normal";
import * as Spritet from "../../sprite/";
import {degreesToRadians} from "../../helper/helper.js";
import Gun from "./Gun.js";

class Automatic extends Gun {
	constructor(config) {
		super(config);
	}

	take() {
		super.take();
		if (this.bulletCount <= 0) {
			this.reloadBullet();
		}
	}

	isReloading() {
		return this.queueDelay.findIndex(e => e.name == "reload") != -1;
	}

	update(room) {
		super.update(room);
		const owner = room.findObject("gunners", this.ownerID);
		if (!owner) return;
		if (
			owner.mouseDown["left"] &&
			!this.isDelay() &&
			this.bulletCount > 0
		) {
			this.addDelay("fire");

			let status = "running";
			if (!owner.status.moving) status = "staying";
			else if (owner.keyDown["shift"])
				// walking
				status = "walking";

			const noise = randomNormal({
				mean: 0,
				dev: (Math.PI / 180) * (this.dev[status] / 4)
			});

			const radian = degreesToRadians(owner.degree);
			const dx = Math.cos(radian); // default speed x, y for get starPos of bulconst
			const dy = Math.sin(radian);
			const magDefault = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			const scaleDefault = 20 / magDefault;
			const startPos = {
				// vị trí bắn ở đầu nhân vật
				x: owner.pos.x + dx * scaleDefault,
				y: owner.pos.y + dy * scaleDefault
			};

			const radianSpeed = radian + noise;
			const sx = Math.cos(radianSpeed); // nx means noised position x
			const sy = Math.sin(radianSpeed);
			const magSpeed = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
			const scaleSpeed = this.speed / magSpeed; // scale cho cái speed = bulconstconfig>speed
			const speedVector = {
				// vector speed đạn
				x: sx * scaleSpeed,
				y: sy * scaleSpeed
			};

			room.addObject(
				"bullets",
				new Sprite.Bullet({
					id: Date.now(),
					type: this.name,
					name: this.name,
					pos: startPos,
					defaultRange: 25,
					size: this.size,
					ownerID: owner.id,
					speed: speedVector, //vector bullet go
					friction: this.friction,
					imgName: this.imgName
				})
			);
			this.bulletCount--;
		} else {
			if (this.bulletCount <= 0 && !this.isReloading()) {
				this.reloadBullet();
				console.log(this.queueDelay);
			}
		}
	}
}

export default Automatic;