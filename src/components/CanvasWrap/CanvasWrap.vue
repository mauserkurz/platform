<template>
  <div class="canvas-wrap">
    <Display
      :level="level"
      :state="state"
      :clear-count="clearCount"/>
  </div>
</template>

<script>
// TODO add logic to store
// TODO store unit test
// TODO unit test
// TODO add es6 - es10 babel plugins
// TODO add exit game
// TODO add restart level
// TODO add restart game
// TODO add pause
// TODO add health
// TODO add monster
// TODO add help with keys and rules
import GAME_LEVELS from '@/gameLevels';
import State from '@/models/State';
import Level from '@/models/Level';
import Display from '@/components/Display/Display.vue';
import { ARROW_KEY_LIST } from '@/consts';

// TODO add comments
export default {
  name: 'CanvasWrap',

  components: { Display },

  data() {
    return {
      arrowKeys: {},
      level: null,
      state: null,
      clearCount: 0,
    };
  },

  methods: {
    trackArrowKeys() {
      const track = (event) => {
        if (ARROW_KEY_LIST.includes(event.key)) {
          this.arrowKeys[event.key] = event.type === 'keydown';
          event.preventDefault();
        }
      };
      window.addEventListener('keydown', track);
      window.addEventListener('keyup', track);
    },

    resetArrowKeys() {
      this.arrowKeys = {};
    },

    runAnimation(frameFunc) {
      const SECOND = 1000;
      const TICK = 100;
      let lastTime = null;

      const frame = (time) => {
        if (lastTime !== null) {
          const timeStep = Math.min(time - lastTime, TICK) / SECOND;

          if (frameFunc(timeStep) === false) {
            return;
          }
        }
        lastTime = time;
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },

    async runLevel(level) {
      this.level = level;
      this.state = State.start(level);
      let ending = 1;

      return new Promise((resolve) => {
        this.runAnimation((time) => {
          this.state = this.state.update(time, this.arrowKeys);

          if (this.state.status === State.statusMap.playing) {
            return true;
          }
          if (ending > 0) {
            ending -= time;
            return true;
          }
          this.clearCount += 1;
          resolve(this.state.status);
          return false;
        });
      });
    },

    async runGame(plans) {
      this.trackArrowKeys();

      for (let level = 0; level < plans.length;) {
        // eslint-disable-next-line no-await-in-loop
        const status = await this.runLevel(new Level(plans[level]));

        if (status === State.statusMap.won) {
          level += 1;
        } else if (status === State.statusMap.lost) {
          // TODO replace alert with component notificator
          // eslint-disable-next-line no-alert
          alert('You lost');
        }
        this.resetArrowKeys();
      }
      // TODO replace alert with component notificator
      // eslint-disable-next-line no-alert
      alert("You've won!");
    },
  },

  mounted() {
    this.runGame(GAME_LEVELS);
  },
};
</script>

<style scoped lang="less">
.canvas-wrap {}
</style>
