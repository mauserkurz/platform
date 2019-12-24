import createVector from '.';

describe('factory createVector', () => {
  it('метод plus должен вернуть новый вектор, добавив x и y переданного вектора', () => {
    const vector = createVector(1, 3);
    const nextVector = createVector(2, 4);
    const sumVector = vector.plus(nextVector);

    expect(sumVector).toMatchObject({ x: 3, y: 7 });
  });

  it(`метод times должен вернуть новый вектор, увеличив x и y в factor раз, передаенные как
   аргумент`, () => {
    const vector = createVector(1, 3);

    expect(vector.times(2)).toMatchObject({ x: 2, y: 6 });
  });
});
