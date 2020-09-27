<template>
  <div class="display">
    <canvas ref="canvas"></canvas>
    <img
      class="display__sprite"
      ref="otherSprites"
      src="@/assets/sprites.png"/>
    <img
      class="display__sprite"
      ref="playerSprites"
      src="@/assets/player.png"/>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import {
  SCALE,
  PLAYER_CONFIG,
  LAVA_CONFIG,
  COIN_CONFIG,
  EMPTY_CONFIG,
  STATUS_MAP,
} from '@/consts';

export default {
  name: 'Display',

  data() {
    return {
      cx: null,
      flipPlayer: false,
      viewport: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
    };
  },

  watch: {
    status: 'init',
    stateChange: 'syncState',
    countEndLevel: 'clear',
  },

  computed: {
    ...mapState('core', ['actors', 'status']),
    ...mapState('level', ['levelWidth', 'levelHeight', 'rows', 'countEndLevel']),
    ...mapGetters('core', ['player', 'stateChange']),
  },

  methods: {
    /**
     * Развернет спрайт в противоположное напрваление по горизонтали
     * @param {number} around - положение спрайта
     */
    flipHorizontally(around) {
      this.cx.translate(around, 0);
      this.cx.scale(-1, 1);
      this.cx.translate(-around, 0);
    },

    /**
     * Обновит видимую часть уровня на canvas, при этом не двигаясь когда
     * игрок сместится больше чем на 1/3 ширины видимой части
     * @param {number} levelWidth - ширина уровня
     * @param {number} levelHeight - высота уровня
     * @param {object} player - данные о игроке
     */
    updateViewport(levelWidth, levelHeight, player) {
      const {
        left,
        top,
        width,
        height,
      } = this.viewport;
      const getMargin = size => size / 3;
      const horizontalMargin = getMargin(width);
      const verticalMargin = getMargin(height);
      const center = player.pos.plus(player.size.times(0.5));

      if (center.x < left + horizontalMargin) {
        this.viewport.left = Math.max(center.x - horizontalMargin, 0);
      } else if (center.x > left + width - horizontalMargin) {
        this.viewport.left = Math.min(center.x + horizontalMargin - width, levelWidth - width);
      }
      if (center.y < top + verticalMargin) {
        this.viewport.top = Math.max(center.y - verticalMargin, 0);
      } else if (center.y > top + height - verticalMargin) {
        this.viewport.top = Math.min(center.y + verticalMargin - height, levelHeight - height);
      }
    },

    /**
     * Отрисует фон уровня на canvas состоящий из неподвижных элементов этого уровня
     * @param {array} rows - двумерный массив сущностей находящихся на уровне, предствленных
     * строками типов сущностей или конструкторами сущностей
     */
    drawBackground(rows) {
      const {
        left,
        top,
        width,
        height,
      } = this.viewport;
      const xStart = Math.floor(left);
      const xEnd = Math.ceil(left + width);
      const yStart = Math.floor(top);
      const yEnd = Math.ceil(top + height);

      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          if (!rows[y] || !rows[y][x]) {
            // eslint-disable-next-line no-continue
            continue;
          }
          const tile = rows[y][x];

          if (tile === EMPTY_CONFIG.TYPE) {
            // eslint-disable-next-line no-continue
            continue;
          }
          const screenX = (x - left) * SCALE;
          const screenY = (y - top) * SCALE;
          const tileX = tile === LAVA_CONFIG.TYPE ? SCALE : 0;

          this.cx.drawImage(
            this.$refs.otherSprites,
            tileX,
            0,
            SCALE,
            SCALE,
            screenX,
            screenY,
            SCALE,
            SCALE,
          );
        }
      }
    },

    /**
     * Обновит фон в зависимости от статуса игры
     * @param {string} status - статус уровня, который может быть - победа, поражение или играет
     */
    fillDisplay(status) {
      const BACKGROUND_COLOR_MAP = {
        [STATUS_MAP.PLAYING]: '#34a6fb',
        [STATUS_MAP.LOST]: '#2c88d6',
        [STATUS_MAP.WON]: '#44bfff',
      };

      this.cx.fillStyle = BACKGROUND_COLOR_MAP[status];
      this.cx.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
    },

    /**
     * Обновит спрайт игрока на canvas
     * @param {object} player - данные о игроке
     * @param {number} x - ордината игрока в видимой части экрана
     * @param {number} y - абсцисса игрока в видимой части экрана
     * @param {number} width - ширина игрока
     * @param {number} height - высота игрока
     */
    drawPlayer(player, x, y, width, height) {
      const widthWithOverlap = width + PLAYER_CONFIG.X_OVERLAP * 2;
      const xWithoutOverlap = x - PLAYER_CONFIG.X_OVERLAP;

      if (player.speed.x !== 0) {
        this.flipPlayer = player.speed.x < 0;
      }

      let tile = 8;
      if (player.speed.y !== 0) {
        tile = 9;
      } else if (player.speed.x !== 0) {
        tile = Math.floor(Date.now() / 60) % 8;
      }

      this.cx.save();
      if (this.flipPlayer) {
        this.flipHorizontally(xWithoutOverlap + widthWithOverlap / 2);
      }
      const tileX = tile * widthWithOverlap;

      this.cx.drawImage(
        this.$refs.playerSprites,
        tileX,
        0,
        widthWithOverlap,
        height,
        xWithoutOverlap,
        y,
        widthWithOverlap,
        height,
      );
      this.cx.restore();
    },

    /**
     * Отрисует спрайты всех подвижных сущностей на canvas
     * @param {array} actors - список всех подвижных сущностей на уровне
     */
    drawActors(actors) {
      for (const actor of actors) {
        const width = actor.size.x * SCALE;
        const height = actor.size.y * SCALE;
        const x = (actor.pos.x - this.viewport.left) * SCALE;
        const y = (actor.pos.y - this.viewport.top) * SCALE;

        if (actor.type === PLAYER_CONFIG.TYPE) {
          this.drawPlayer(actor, x, y, width, height);
        } else {
          const tileX = (actor.type === COIN_CONFIG.TYPE ? 2 : 1) * SCALE;
          this.cx.drawImage(this.$refs.otherSprites, tileX, 0, width, height, x, y, width, height);
        }
      }
    },

    /**
     * Обновит canvas перерисовав фон, сущносей на экране и их положение в зависимости от
     * данных о уровне для этого кадра анимации
     */
    syncState() {
      if (this.status) {
        this.updateViewport(this.levelWidth, this.levelHeight, this.player);
        this.fillDisplay(this.status);
        this.drawBackground(this.rows);
        this.drawActors(this.actors);
      }
    },

    /**
     * Очистит canvas
     */
    clear() {
      if (this.status) {
        this.cx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      }
    },

    /**
     * Перепишит размера canvas на размер открытого окна или размер уровня,
     * если он меньше окна
     */
    resizeCanvas() {
      const { clientWidth, clientHeight } = document.documentElement;

      this.$refs.canvas.width = Math.min(clientWidth, this.levelWidth * SCALE);
      this.$refs.canvas.height = Math.min(clientHeight, this.levelHeight * SCALE);
      this.viewport.width = this.$refs.canvas.width / SCALE;
      this.viewport.height = this.$refs.canvas.height / SCALE;
    },

    /**
     * Подготовит canvas к отрисовке уровня на нем, задав ему размеры и записав контекст
     */
    init() {
      this.resizeCanvas();
      this.cx = this.$refs.canvas.getContext('2d');
      window.addEventListener('resize', () => this.resizeCanvas());
    },
  },
};
</script>

<style scoped lang="less">
.display {
  &__sprite {
    display: none;
  }
}
</style>
