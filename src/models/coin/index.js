/**
 * @file фабрика для создания сущности монеты
 */
import createVector from '@/models/vector/';
import { COIN_CONFIG, STATUS_MAP } from '@/consts';

const COIN_SIZE = createVector(COIN_CONFIG.WIDTH, COIN_CONFIG.HEIGHT);

/**
 * создаст новую монету
 * @param {object} pos - новые координаты положения
 * @param {object} basePos - начальные координаты положения
 * @param {number} wobble - коофициент отклонения монеты от центра
 * @return {object} -
 */
export const createCoin = (pos, basePos, wobble) => ({
  pos,
  basePos,
  wobble,

  get size() {
    return COIN_SIZE;
  },

  get type() {
    return COIN_CONFIG.TYPE;
  },

  /**
   * пересоздаст монету сместив её от центра в зависимости от времени анимации (time)
   * @param {number} time - время между новым и прошлым кадром анимации в секундах
   * @return {object} - новая монета
   */
  update(time) {
    const updatedWobble = this.wobble + time * COIN_CONFIG.WOBBLE_SPEED;
    const wobblePos = Math.sin(wobble) * COIN_CONFIG.WOBBLE_DIST;

    return createCoin(
      this.basePos.plus(createVector(0, wobblePos)),
      this.basePos,
      updatedWobble,
    );
  },

  /**
   * удалит монету из уровня и если больше не останется монет, статус игры сменится на победу,
   * вызвается в случае столкновения игрока с монетой
   * @param {array} actors - подвижные объекты на уровне
   * @param {string} status - статус состояния игры: продолжается, победа или поражение
   * @return {{actors: {array}, status: (string)}} - объект с обновленными данными
   * где actors - обновленными данные о подвижных объектах на уровне,
   * status - обновленный статус игры
   */
  collide({ actors, status }) {
    const filtered = actors.filter(a => a !== this);
    let currentStatus = status;

    if (!filtered.some(a => a.type === COIN_CONFIG.TYPE)) {
      currentStatus = STATUS_MAP.WON;
    }
    return {
      actors: filtered,
      status: currentStatus,
    };
  },
});

/**
 * создаст монету для нового уровня со параметрами по умолчанию
 * @param {object} pos - координаты положения
 * @return {object} - новая монета
 */
export default (pos) => {
  const basePosition = pos.plus(createVector(
    COIN_CONFIG.POSITION_CORRECTION.X,
    COIN_CONFIG.POSITION_CORRECTION.Y,
  ));

  return createCoin(basePosition, basePosition, Math.random() * Math.PI * 2);
};
