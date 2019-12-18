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
import State from '@/models/State';
import Level from '@/models/Level';
import {
  SCALE,
  PLAYER_CONFIG,
  LAVA_CONFIG,
  COIN_CONFIG,
  EMPTY_CONFIG,
} from '@/consts';

// TODO add comments
export default {
  name: 'Display',

  props: {
    state: {
      required: true,
      validator: prop => prop instanceof State || prop === null,
    },

    level: {
      required: true,
      validator: prop => prop instanceof Level || prop === null,
    },

    clearCount: {
      type: Number,
      required: true,
    },
  },

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
    level() {
      this.init();
    },

    state(value) {
      this.syncState(value);
    },

    clearCount() {
      this.clear();
    },
  },

  methods: {
    flipHorizontally(around) {
      this.cx.translate(around, 0);
      this.cx.scale(-1, 1);
      this.cx.translate(-around, 0);
    },

    updateViewport({ level, player }) {
      const {
        left,
        top,
        width,
        height,
      } = this.viewport;
      const margin = width / 3;
      const center = player.pos.plus(player.size.times(0.5));

      if (center.x < left + margin) {
        this.viewport.left = Math.max(center.x - margin, 0);
      } else if (center.x > left + width - margin) {
        this.viewport.left = Math.min(center.x + margin - width, level.width - width);
      }
      if (center.y < top + margin) {
        this.viewport.top = Math.max(center.y - margin, 0);
      } else if (center.y > top + height - margin) {
        this.viewport.top = Math.min(center.y + margin - height, level.height - height);
      }
    },

    drawBackground(level) {
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
          const tile = level.rows[y][x];

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

    clearDisplay(status) {
      const BACKGROUND_COLOR_MAP = {
        [State.statusMap.playing]: 'rgb(52, 166, 251)',
        [State.statusMap.lost]: 'rgb(44, 136, 214)',
        [State.statusMap.won]: 'rgb(68, 191, 255)',
      };

      this.cx.fillStyle = BACKGROUND_COLOR_MAP[status];
      this.cx.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
    },

    drawPlayer(player, x, y, width, height) {
      // eslint-disable-next-line no-param-reassign
      width += PLAYER_CONFIG.X_OVERLAP * 2;
      // eslint-disable-next-line no-param-reassign
      x -= PLAYER_CONFIG.X_OVERLAP;

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
        this.flipHorizontally(x + width / 2);
      }
      const tileX = tile * width;

      this.cx.drawImage(this.$refs.playerSprites, tileX, 0, width, height, x, y, width, height);
      this.cx.restore();
    },

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

    syncState(state) {
      this.updateViewport(state);
      this.clearDisplay(state.status);
      this.drawBackground(state.level);
      this.drawActors(state.actors);
    },

    clear() {
      this.cx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
    },

    init() {
      this.$refs.canvas.width = Math.min(600, this.level.width * SCALE);
      this.$refs.canvas.height = Math.min(450, this.level.height * SCALE);
      this.cx = this.$refs.canvas.getContext('2d');
      this.viewport.width = this.$refs.canvas.width / SCALE;
      this.viewport.height = this.$refs.canvas.height / SCALE;
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
