<template>
  <div class="display-wrap">
    <v-alert
      v-if="isLost"
      type="error"
      dismissible>You lost</v-alert>
    <v-alert
      v-if="isAllLevelCompleted"
      type="success"
      dismissible>You've won!</v-alert>
    <Display/>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import GAME_LEVELS from '@/gameLevels';
import Display from '@/components/Display/Display.vue';
import { ARROW_KEY_LIST, STATUS_MAP } from '@/consts';

export default {
  name: 'DisplayWrap',

  components: { Display },

  data() {
    return {
      arrowKeys: {},
      isAllLevelCompleted: false,
    };
  },

  computed: {
    ...mapState('core', ['status']),

    isWon() {
      return this.status === STATUS_MAP.WON;
    },

    isLost() {
      return this.status === STATUS_MAP.LOST;
    },

    isPlaying() {
      return this.status === STATUS_MAP.PLAYING;
    },
  },

  methods: {
    ...mapMutations('level', ['ADD_END_LEVEL']),
    ...mapActions('core', ['update']),
    ...mapActions('level', ['start']),

    /**
     * Начнет отслеживать события нажатия клавишь, указанных в ARROW_KEY_LIST
     * записывая зажатые клавиши в arrowKeys
     */
    trackArrowKeys() {
      const track = (event) => {
        if (!this.isPlaying) {
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

    /**
     * Сбросит записи о нажатых клавишах, чтобы можно было останавливать
     * игрока при смене статуса игры
     */
    resetArrowKeys() {
      this.arrowKeys = {};
    },

    /**
     * Запустит анимацию, выполняя в каждом кадре переданную функцию
     * @param {function} frameFunc - коллбэк, выполняющий обновление данных уровня
     */
    runAnimation(frameFunc) {
      const SECOND = 1000;
      const TICK = 100;
      let lastTime = null;

      const frame = (time) => {
        if (lastTime !== null) {
          const timeStep = Math.min(time - lastTime, TICK) / SECOND;

          if (!frameFunc(timeStep)) {
            return;
          }
        }
        lastTime = time;
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },

    /**
     * Подготовит дынные об уровне, используя переданный шаблон, запустит анимацию, во время которой
     * будут сменяться данные о уровне и перересовываться canvas
     * @param {string} plan - строка шаблон уровня
     * @return {Promise<undefined>}
     */
    async runLevel(plan) {
      let ending = 1;

      this.start(plan);

      return new Promise((resolve) => {
        this.runAnimation((time) => {
          this.update({ time, keys: this.arrowKeys });

          if (this.isPlaying) {
            return true;
          }
          if (ending > 0) {
            ending -= time;
            return true;
          }
          this.ADD_END_LEVEL();
          resolve();
          return false;
        });
      });
    },
  },

  /**
   * Начнет отслеживание нажатых клавишь и стартует последовательный запуск уровеней
   * при прохождении или перезапуск при проигрыше
   * @return {Promise<void>}
   */
  async mounted() {
    this.trackArrowKeys();

    for (let level = 0; level < GAME_LEVELS.length;) {
      // eslint-disable-next-line no-await-in-loop
      await this.runLevel(GAME_LEVELS[level]);

      if (this.isWon) {
        level += 1;
      }
      this.resetArrowKeys();
    }
    this.isAllLevelCompleted = true;
  },
};
</script>

<style scoped lang="less">
.display-wrap {}
</style>
