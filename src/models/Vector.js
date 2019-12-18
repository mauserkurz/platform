// TODO add comments
export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  times(factor = 1) {
    return new Vector(this.x * factor, this.y * factor);
  }
}
