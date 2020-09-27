export const SCALE = 40;
export const GRAVITY = 30;
export const PLAYER_CONFIG = {
  WIDTH: 0.8,
  HEIGHT: 1.5,
  X_SPEED: 7,
  JUMP_SPEED: 17,
  POSITION_CORRECTION: {
    X: 0,
    Y: -0.5,
  },
  START_SPEED: {
    X: 0,
    Y: 0,
  },
  X_OVERLAP: SCALE / 5,
  TYPE: 'player',
};
export const LAVA_CONFIG = {
  WIDTH: 1,
  HEIGHT: 1,
  HORIZONTAL: {
    X_SPEED: 2,
    Y_SPEED: 0,
  },
  VERTICAL: {
    X_SPEED: 0,
    Y_SPEED: 2,
  },
  FALLING: {
    X_SPEED: 0,
    Y_SPEED: 3,
  },
  TYPE: 'lava',
};
export const COIN_CONFIG = {
  WIDTH: 0.6,
  HEIGHT: 0.6,
  WOBBLE_SPEED: 8,
  WOBBLE_DIST: 0.07,
  POSITION_CORRECTION: {
    X: 0.2,
    Y: 0.1,
  },
  TYPE: 'coin',
};
export const WALL_CONFIG = {
  TYPE: 'wall',
};
export const EMPTY_CONFIG = {
  TYPE: 'empty',
};
export const ARROW_KEY_LIST = ['ArrowLeft', 'ArrowRight', 'ArrowUp'];
export const IE_ARROW_KEY_LIST = ARROW_KEY_LIST.map(key => key.replace('Arrow', ''));
export const STATUS_MAP = {
  PLAYING: 'playing',
  LOST: 'lost',
  WON: 'won',
};
export const THEME = {
  primary: '#ee44aa',
  secondary: '#424242',
  accent: '#82B1FF',
  error: '#FF5252',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107',
};
