import State from '@/models/State';
import Vector from '@/models/Vector';
import { COIN_CONFIG } from '@/consts';

// TODO DI of State
// TODO DI of Vector
const COIN_SIZE = new Vector(COIN_CONFIG.WIDTH, COIN_CONFIG.HEIGHT);

// TODO add comments
export default class Coin {
  #wobbleSpeed = COIN_CONFIG.WOBBLE_SPEED;

  #wobbleDist = COIN_CONFIG.WOBBLE_DIST;

  #type = COIN_CONFIG.TYPE;

  #size = COIN_SIZE;

  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get size() {
    return this.#size;
  }

  get type() {
    return this.#type;
  }

  update(time) {
    const wobble = this.wobble + time * this.#wobbleSpeed;
    const wobblePos = Math.sin(wobble) * this.#wobbleDist;

    return new Coin(
      this.basePos.plus(new Vector(0, wobblePos)),
      this.basePos, wobble,
    );
  }

  collide({ actors, status, level }) {
    const filtered = actors.filter(a => a !== this);
    let currentStatus = status;

    if (!filtered.some(a => a.type === COIN_CONFIG.TYPE)) {
      currentStatus = State.statusMap.won;
    }
    return new State(level, filtered, currentStatus);
  }

  static create(pos) {
    const basePosition = pos.plus(new Vector(
      COIN_CONFIG.POSITION_CORRECTION.X,
      COIN_CONFIG.POSITION_CORRECTION.Y,
    ));

    return new Coin(basePosition, basePosition, Math.random() * Math.PI * 2);
  }
}
