import createVector from '@/models/vector/';
import { STATUS_MAP } from '@/consts';
import createLava from '.';

describe('factory createLava', () => {
  describe('метод update пересоздаст сущность лавы', () => {
    it(`должен добавить к положению прирост координат в зависимости от скорости
     и времени анимации`, () => {
      const lava = createLava(createVector(0, 0), '=').update(0.05, () => false);

      expect(lava.pos).toMatchObject({ x: 0.1, y: 0 });
    });

    it(`должен когда touches вернет true - то есть дальше лава пересечет стену, вернуть
    положение к исходному при наличии этого исходного положения (reset)`, () => {
      const lava = createLava(createVector(0, 0), 'v')
        .update(0.05, () => false)
        .update(0.05, () => true);

      expect(lava.pos).toMatchObject({ x: 0, y: 0 });
    });

    it(`должен когда touches вернет true - то есть дальше лава пересечет стену, изменить
    напрваление движения на противоположное`, () => {
      const lava = createLava(createVector(0, 0), '|')
        .update(0.05, () => false)
        .update(0.05, () => true);

      expect(lava.pos).toMatchObject({ x: 0, y: 0.1 });
    });
  });

  it('метод collide должен вернуть данные о уровне, сменив статус игры на поражение', () => {
    const lava = createLava(createVector(0, 0), '|');
    const level = {
      actors: [lava],
      status: STATUS_MAP.PLAYING,
    };

    expect(lava.collide(level)).toEqual({
      actors: [lava],
      status: STATUS_MAP.LOST,
    });
  });
});
