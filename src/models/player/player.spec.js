import createVector from '@/models/vector/';
import createPlayer from '.';

describe('factory createPlayer', () => {
  describe('метод update пересоздаст сущность игрока', () => {
    it('должен падать, когда ничто не нажато', () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, () => false, {});

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it('должен не двигаться, когда ничто не нажато и касается стены под собой', () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, touches, {});

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });

    it(`должен сместиться вниз, когда зажата клавиша вверх, так как нельзя прыгать
      без опоры`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, () => false, { ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it('должен сместиться вверх, когда зажата клавиша вверх и касается стены под собой', () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, touches, { ArrowUp: true })
        .update(0.05, touches, {});

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(-0.7749999999999999);
    });

    it('должен при зажатой клавише вправо сместить игрока вправо и вниз', () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, () => false, { ArrowRight: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0.35000000000000003);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатой клавише вправо сместить игрока вправо, не падая при ограничении
      внизу`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, touches, { ArrowRight: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0.35000000000000003);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });

    it(`должен при зажатой клавише вправо остаться на месте и падать при ограничении
      справа`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, touches, { ArrowRight: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатой клавише вправо оставаться на месте, не падая при ограничении
      внизу и справа`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, () => true, { ArrowRight: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });

    it(`должен при зажатых клавишах вправо и вверх сместить игрока вправо и вниз,
      так как нельзя пригать не без опоры`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, () => false, { ArrowRight: true, ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0.35000000000000003);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатых клавишах вправо и вверх сместить игрока вправо и вверх
      когда есть пол`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, touches, { ArrowRight: true, ArrowUp: true })
        .update(0.05, touches, { ArrowRight: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0.7000000000000001);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(-0.7749999999999999);
    });

    it(`должен при зажатых клавишах вправо и вверх остаться на месте и падать при ограничении
      справа`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, touches, { ArrowRight: true, ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатых клавишах вправо и вверх оставаться на месте, не падая при ограничении
      внизу и справа`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, () => true, { ArrowRight: true, ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });

    it('должен при зажатой клавише влево сместить игрока влево и вниз', () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, () => false, { ArrowLeft: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(-0.35000000000000003);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатой клавише влево сместить игрока влево, не падая при ограничении
      внизу`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, touches, { ArrowLeft: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(-0.35000000000000003);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });

    it(`должен при зажатой клавише влево остаться на месте и падать при ограничении
      слева`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, touches, { ArrowLeft: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатой клавише влево оставаться на месте, не падая при ограничении
      внизу и слева`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player.update(0.05, () => true, { ArrowLeft: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });

    it(`должен при зажатых клавишах влево и вверх сместить игрока влево и вниз,
      так как нельзя пригать не без опоры`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, () => false, { ArrowLeft: true, ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(-0.35000000000000003);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатых клавишах влево и вверх сместить игрока влево и вверх
      когда есть пол`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, touches, { ArrowLeft: true, ArrowUp: true })
        .update(0.05, touches, { ArrowLeft: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(-0.7000000000000001);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(-0.7749999999999999);
    });

    it(`должен при зажатых клавишах влево и вверх остаться на месте и падать при ограничении
      справа`, () => {
      const touches = jest.fn();

      touches
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, touches, { ArrowLeft: true, ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0.07500000000000001);
    });

    it(`должен при зажатых клавишах влево и вверх оставаться на месте, не падая при ограничении
      внизу и справа`, () => {
      const player = createPlayer(createVector(0, 0));
      const updatedPlayer = player
        .update(0.05, () => true, { ArrowLeft: true, ArrowUp: true });

      expect(updatedPlayer.pos.x - player.pos.x).toBe(0);
      expect(updatedPlayer.pos.y - player.pos.y).toBe(0);
    });
  });
});
