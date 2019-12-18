import Vector from '@/models/Vector';
import Player from '@/models/Player';
import Lava from '@/models/Lava';
import Coin from '@/models/Coin';
import { LAVA_CONFIG, WALL_CONFIG, EMPTY_CONFIG } from '@/consts';

// TODO DI of Vector
// TODO add comments
export default class Level {
  constructor(plan) {
    const rows = plan.trim().split('\n').map(row => [...row.trim()]);

    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];
    this.rows = rows.map((row, y) => row.map((char, x) => {
      const type = Level.levelChars[char];

      if (typeof type === 'string') {
        return type;
      }

      this.startActors.push(type.create(new Vector(x, y), char));
      return EMPTY_CONFIG.TYPE;
    }));
  }

  static get levelChars() {
    return {
      '.': EMPTY_CONFIG.TYPE,
      '#': WALL_CONFIG.TYPE,
      '+': LAVA_CONFIG.TYPE,
      '=': Lava,
      '|': Lava,
      v: Lava,
      o: Coin,
      '@': Player,
    };
  }

  touches(pos, size, type) {
    const xStart = Math.floor(pos.x);
    const xEnd = Math.ceil(pos.x + size.x);
    const yStart = Math.floor(pos.y);
    const yEnd = Math.ceil(pos.y + size.y);

    for (let y = yStart; y < yEnd; y += 1) {
      for (let x = xStart; x < xEnd; x += 1) {
        const isOutside = x < 0 || x >= this.width
          || y < 0 || y >= this.height;
        const here = isOutside ? WALL_CONFIG.TYPE : this.rows[y][x];

        if (here === type) {
          return true;
        }
      }
    }
    return false;
  }
}
