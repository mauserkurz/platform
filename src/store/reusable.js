export const setProp = prop => (state, value) => {
  state[prop] = value;
};

export const plus = prop => (state) => {
  state[prop] += 1;
};
