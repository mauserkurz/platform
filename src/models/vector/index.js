/**
 * @file содержит фабрику, для создания сущности вектора
 */

/**
 * создаст новый вектор с переданными параметрами x и y
 * @param {number} x - абсцисса
 * @param {number} y - ордината
 * @return {object} - вектор
 */
const createVector = (x, y) => ({
  x,
  y,

  /**
   * создаст новый вектор с суммой x и y вектора и вектора из аргумента
   * @param {object} other - вектор, x и y которого будут добавлены
   * @return {object} - вектор с суммой координат
   */
  plus(other) {
    return createVector(this.x + other.x, this.y + other.y);
  },

  /**
   * создаст новый вектор с умноженными x и y на factor раз
   * @param {number} factor - коэфицинет, указывающий во сколько раз нужно умножить координаты
   * @return {object} - вектор с новыми координатами
   */
  times(factor) {
    return createVector(this.x * factor, this.y * factor);
  },
});

export default createVector;
