<template>
  <Display/>
</template>

<script>
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
import { mapState, mapMutations, mapActions } from 'vuex';
import GAME_LEVELS from '@/gameLevels';
import Display from '@/components/Display/Display.vue';
import { ARROW_KEY_LIST, STATUS_MAP } from '@/consts';

// TODO add comments
export default {
  name: 'DisplayWrap',

  components: { Display },

  data() {
    return { arrowKeys: {} };
  },

  computed: {
    ...mapState('core', ['status']),
  },

  methods: {
    ...mapMutations('level', ['ADD_END_LEVEL', 'ADD_END_LEVEL']),
    ...mapActions('core', ['start', 'update']),

    trackArrowKeys() {
      const track = (event) => {
        if (this.status !== STATUS_MAP.PLAYING) {
          this.resetArrowKeys();
          return;
        }

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

    async runLevel(plan) {
      let ending = 1;

      this.start(plan);
      this.ADD_END_LEVEL();

      return new Promise((resolve) => {
        this.runAnimation((time) => {
          this.update({ time, keys: this.arrowKeys });

          if (this.status === STATUS_MAP.PLAYING) {
            return true;
          }
          if (ending > 0) {
            ending -= time;
            return true;
          }
          this.ADD_END_LEVEL();
          resolve(this.status);
          return false;
        });
      });
    },

    async runGame(plans) {
      this.trackArrowKeys();

      for (let level = 0; level < plans.length;) {
        // eslint-disable-next-line no-await-in-loop
        const status = await this.runLevel(plans[level]);

        if (status === STATUS_MAP.WON) {
          level += 1;
        } else if (status === STATUS_MAP.LOST) {
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
