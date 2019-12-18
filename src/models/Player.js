import Vector from '@/models/Vector';
import { PLAYER_CONFIG, WALL_CONFIG, GRAVITY } from '@/consts';

// TODO DI of Vector?
const PLAYER_SIZE = new Vector(PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT);

// TODO add comments
export default class Player {
  #playerXSpeed = PLAYER_CONFIG.X_SPEED;

  #gravity = GRAVITY;

  #jumpSpeed = PLAYER_CONFIG.JUMP_SPEED;

  #size = PLAYER_SIZE;

  #type = PLAYER_CONFIG.TYPE;

  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
  }

  get size() {
    return this.#size;
  }

  get type() {
    return this.#type;
  }

  update(time, state, keys) {
    let { pos } = this;
    let xSpeed = 0;

    if (keys.ArrowLeft) {
      xSpeed -= this.#playerXSpeed;
    }
    if (keys.ArrowRight) {
      xSpeed += this.#playerXSpeed;
    }
    const movedX = pos.plus(new Vector(xSpeed * time, 0));

    if (!state.level.touches(movedX, this.size, WALL_CONFIG.TYPE)) {
      pos = movedX;
    }

    let ySpeed = this.speed.y + time * this.#gravity;
    const movedY = pos.plus(new Vector(0, ySpeed * time));

    if (!state.level.touches(movedY, this.size, WALL_CONFIG.TYPE)) {
      pos = movedY;
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -this.#jumpSpeed;
    } else {
      ySpeed = 0;
    }
    return new Player(pos, new Vector(xSpeed, ySpeed));
  }

  static create(pos) {
    return new Player(
      pos.plus(
        new Vector(
          PLAYER_CONFIG.POSITION_CORRECTION.X,
          PLAYER_CONFIG.POSITION_CORRECTION.Y,
        ),
      ),
      new Vector(
        PLAYER_CONFIG.START_SPEED.X,
        PLAYER_CONFIG.START_SPEED.Y,
      ),
    );
  }
}
