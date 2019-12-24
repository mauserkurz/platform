import createVector from '@/models/vector/';
import { STATUS_MAP } from '@/consts';
import createInitialCoin, { createCoin } from '.';

describe('factory createInitialCoin', () => {
  it(`метод update должен вернуть новую монету, в которой в поле basePos будут данные
  о координтатах со смещение по сравнению с начальными координатами в поле pos зависящим от
  переданного time`, () => {
    const coin = createCoin(createVector(0, 0), createVector(0, 0), Math.PI).update(0.05);

    expect(coin.pos).toMatchObject({ x: 0, y: 8.572527594031473e-18 });
  });

  describe('метод collide для обработки столкновения с игрока с монетой', () => {
    it('должен вернуть данные о уровне, удалив монету', () => {
      const coin = createInitialCoin(createVector(0, 0));
      const otherCoin = createInitialCoin(createVector(0, 1));
      const level = {
        actors: [coin, otherCoin],
        status: STATUS_MAP.PLAYING,
      };

      expect(coin.collide(level)).toEqual({
        actors: [otherCoin],
        status: STATUS_MAP.PLAYING,
      });
    });

    it('должен вернуть данные о уровне без монет и задав статус игры - победа', () => {
      const coin = createInitialCoin(createVector(0, 0));
      const level = {
        actors: [coin],
        status: STATUS_MAP.PLAYING,
      };

      expect(coin.collide(level)).toEqual({
        actors: [],
        status: STATUS_MAP.WON,
      });
    });
  });
});
