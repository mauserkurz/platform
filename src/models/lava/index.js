/**
 * @file фабрика для создания сущности лавы
 */

import createVector from '@/models/vector/';
import { LAVA_CONFIG, WALL_CONFIG, STATUS_MAP } from '@/consts';

const LAVA_SIZE = createVector(LAVA_CONFIG.WIDTH, LAVA_CONFIG.HEIGHT);

/**
 * создаст новую сущность лавы
 * @param {object} pos - данные с координатами положения
 * @param {object} speed - данные с вектором, прибавляемыми за 1 секунду
 * @param {object} reset - данные с координатами исходного положения, требуется восстановления
 * положения "капающей" лавы
 * @return {object} - новая сущность лавы
 */
const createLava = (pos, speed, reset) => ({
  pos,
  speed,
  reset,

  get size() {
    return LAVA_SIZE;
  },

  get type() {
    return LAVA_CONFIG.TYPE;
  },

  /**
   * пересоздаст лаву, сместив её координаты если она не коснется стены,
   * в противном случае, если нет данных с исходным положением (reset),
   * то начать двигаться в противоположном направлении от исходного, если есть
   * сбросить положение до исходного
   * @param {number} time - время между новым и прошлым кадром анимации в секундах
   * @param {function} touches - функция, которая вернет булево значение равное
   * true если лава будет пересекать указаный тип объекта уровня, необходима для
   * отскакивания движущейся лавы от стен
   * @return {object} - новая сущность лавы
   */
  update(time, touches) {
    const newPos = this.pos.plus(this.speed.times(time));

    if (!touches(newPos, this.size, WALL_CONFIG.TYPE)) {
      return createLava(newPos, this.speed, this.reset);
    }
    if (this.reset) {
      return createLava(this.reset, this.speed, this.reset);
    }
    return createLava(this.pos, this.speed.times(-1), null);
  },

  /**
   * заменит статус игры на проигрыш, когда будет вызвана при столкновении с игроком
   * @param {array} actors - подвижные объекты на уровне
   * @return {{actors: {array}, status: (string)}} - объект с обновленными данными
   * где actors - обновленными данные о подвижных объектах на уровне,
   * status - обновленный статус игры
   */
  collide({ actors }) {
    return { actors, status: STATUS_MAP.LOST };
  },
});

/**
 * создаст лаву для нового уровня с параметрами по умолчанию, в зависимости от типа лавы
 * @param {object} pos - данные с координатами положения
 * @param {string} char - символ, обозначающий лаву в шаблоне уровня
 * @return {object} - новая сущность лавы
 */
export default (pos, char) => {
  const typeMap = {
    '=': createLava(pos, createVector(LAVA_CONFIG.HORIZONTAL.X_SPEED, LAVA_CONFIG.HORIZONTAL.Y_SPEED), null),
    '|': createLava(pos, createVector(LAVA_CONFIG.VERTICAL.X_SPEED, LAVA_CONFIG.VERTICAL.Y_SPEED), null),
    v: createLava(
      pos,
      createVector(LAVA_CONFIG.FALLING.X_SPEED, LAVA_CONFIG.FALLING.Y_SPEED),
      pos,
    ),
  };

  return typeMap[char];
};
