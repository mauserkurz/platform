import Vector from '@/models/Vector';
import { LAVA_CONFIG, WALL_CONFIG, STATUS_MAP } from '@/consts';

// TODO DI of Vector?
const LAVA_SIZE = new Vector(LAVA_CONFIG.WIDTH, LAVA_CONFIG.HEIGHT);

// TODO add comments
export default class Lava {
  #type = LAVA_CONFIG.TYPE;

  #size = LAVA_SIZE;

  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get size() {
    return this.#size;
  }

  get type() {
    return this.#type;
  }

  update(time, state) {
    const newPos = this.pos.plus(this.speed.times(time));

    if (!state.level.touches(newPos, this.size, WALL_CONFIG.TYPE)) {
      return new Lava(newPos, this.speed, this.reset);
    }
    if (this.reset) {
      return new Lava(this.reset, this.speed, this.reset);
    }
    return new Lava(this.pos, this.speed.times(-1));
  }

  // eslint-disable-next-line class-methods-use-this
  collide({ actors }) {
    return { actors, status: STATUS_MAP.LOST };
  }

  static create(pos, ch) {
    const typeMap = {
      '=': new Lava(pos, new Vector(LAVA_CONFIG.HORIZONTAL.X_SPEED, LAVA_CONFIG.HORIZONTAL.Y_SPEED)),
      '|': new Lava(pos, new Vector(LAVA_CONFIG.VERTICAL.X_SPEED, LAVA_CONFIG.VERTICAL.Y_SPEED)),
      v: new Lava(
        pos,
        new Vector(LAVA_CONFIG.FALLING.X_SPEED, LAVA_CONFIG.FALLING.Y_SPEED),
        pos,
      ),
    };

    return typeMap[ch];
  }
}
