/**
 * @file фабрика для создания сущности игрока
 */
import createVector from '@/models/vector/';
import { PLAYER_CONFIG, WALL_CONFIG, GRAVITY } from '@/consts';

const PLAYER_SIZE = createVector(PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT);

/**
 * создаст новую сущность игрока
 * @param {object} pos - данные с координатами положения
 * @param {object} speed - данные с вектором, прибавляемыми за 1 секунду
 * @return {object} - новая сущность игрока
 */
const createPlayer = (pos, speed) => ({
  pos,
  speed,

  get size() {
    return PLAYER_SIZE;
  },

  get type() {
    return PLAYER_CONFIG.TYPE;
  },

  /**
   * пересоздаст игрока, в зависимости от времени анимации, пересечения с другими
   * объектами на уровне и нажатых клавишь
   * @param {number} time - время между новым и прошлым кадром анимации в секундах
   * @param {function} touches - функция, которая вернет булево значение равное
   * true если игрок будет пересекать указаный тип объекта уровня, необходима для
   * остановки движущейгося игрока перед стеной
   * @param {object} keys - состояние клавиш, которыми управляется игрок
   * @return {object} - новая сущность игрока
   */
  update(time, touches, keys) {
    let position = this.pos;
    let xSpeed = 0;

    if (keys.ArrowLeft) {
      xSpeed -= PLAYER_CONFIG.X_SPEED;
    }
    if (keys.ArrowRight) {
      xSpeed += PLAYER_CONFIG.X_SPEED;
    }
    const movedX = position.plus(createVector(xSpeed * time, 0));

    if (!touches(movedX, this.size, WALL_CONFIG.TYPE)) {
      position = movedX;
    }

    let ySpeed = this.speed.y + time * GRAVITY;
    const movedY = position.plus(createVector(0, ySpeed * time));

    if (!touches(movedY, this.size, WALL_CONFIG.TYPE)) {
      position = movedY;
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -PLAYER_CONFIG.JUMP_SPEED;
    } else {
      ySpeed = 0;
    }
    return createPlayer(position, createVector(xSpeed, ySpeed));
  },
});

/**
 * создаст игрока для нового уровня с параметрами по умолчанию
 * @param {object} position - данные с координатами положения
 * @return {object} - новая сущность игрока
 */
export default position => createPlayer(
  position.plus(
    createVector(
      PLAYER_CONFIG.POSITION_CORRECTION.X,
      PLAYER_CONFIG.POSITION_CORRECTION.Y,
    ),
  ),
  createVector(
    PLAYER_CONFIG.START_SPEED.X,
    PLAYER_CONFIG.START_SPEED.Y,
  ),
);
