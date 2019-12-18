<template>
  <div class="canvas-wrap"/>
</template>

<script>
// TODO add canvas
// TODO refactor classes to factories
// TODO add logic to store
// TODO store unit test
// TODO split vue to components
// TODO create folder and smart components itself
// TODO unit test
// TODO add es6 - es10 babel plugins
// TODO add monster
// TODO add pause
// TODO add health
export default {
  name: 'CanvasWrap',

  mounted() {
    // TODO make json config
    // TODO char annotation comment in config
    const simpleLevelPlan = `
    ......................
    ..#................#..
    ..#..............=.#..
    ..#.........o.o....#..
    ..#.@......#####...#..
    ..#####............#..
    ......#++++++++++++#..
    ......##############..
    ......................`;

    // TODO add comments
    function overlap(actor1, actor2) {
      return actor1.pos.x + actor1.size.x > actor2.pos.x
        && actor1.pos.x < actor2.pos.x + actor2.size.x
        && actor1.pos.y + actor1.size.y > actor2.pos.y
        && actor1.pos.y < actor2.pos.y + actor2.size.y;
    }

    // TODO add comments
    // TODO DI for overlap
    class State {
      constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status; // TODO can add health here
      }

      static start(level) {
        // TODO playing to actor class
        return new State(level, level.startActors, 'playing');
      }

      get player() {
        // TODO player to actor class
        return this.actors.find(a => a.type === 'player');
      }

      update(time, keys) {
        const actors = this.actors
          .map(actor => actor.update(time, this, keys));
        let newState = new State(this.level, actors, this.status);

        // TODO replace to consts
        if (newState.status !== 'playing') {
          return newState;
        }

        const { player } = newState;
        // TODO replace to consts
        if (this.level.touches(player.pos, player.size, 'lava')) {
          // TODO replace to consts
          return new State(this.level, actors, 'lost');
        }

        for (const actor of actors) {
          if (actor !== player && overlap(actor, player)) {
            newState = actor.collide(newState);
          }
        }
        return newState;
      }
    }

    // TODO add comments
    class Vector {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }

      plus(other) {
        return new Vector(this.x + other.x, this.y + other.y);
      }

      times(factor = 1) {
        return new Vector(this.x * factor, this.y * factor);
      }
    }

    // TODO abstract class for Player, Lava, Coin

    // TODO replace to consts or file with Player
    const PLAYER_SIZE = new Vector(0.8, 1.5); // TODO DI of Vector

    // TODO add comments
    class Player {
      #type = 'player';

      #playerXSpeed = 7;

      #gravity = 30;

      #jumpSpeed = 17;

      #size = PLAYER_SIZE;

      constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
      }

      get type() {
        return this.#type;
      }

      get size() {
        return this.#size;
      }

      update(time, state, keys) {
        let { pos } = this;
        let xSpeed = 0;

        if (keys.ArrowLeft) {
          xSpeed -= this.#playerXSpeed;
        }
        if (keys.ArrowRight) {
          xSpeed += this.#playerXSpeed;
        }
        const movedX = pos.plus(new Vector(xSpeed * time, 0));
        // TODO replace to consts
        if (!state.level.touches(movedX, this.size, 'wall')) {
          pos = movedX;
        }

        let ySpeed = this.speed.y + time * this.#gravity;
        const movedY = pos.plus(new Vector(0, ySpeed * time));
        // TODO replace to consts
        if (!state.level.touches(movedY, this.size, 'wall')) {
          pos = movedY;
        } else if (keys.ArrowUp && ySpeed > 0) {
          ySpeed = -this.#jumpSpeed;
        } else {
          ySpeed = 0;
        }
        return new Player(pos, new Vector(xSpeed, ySpeed));
      }

      static create(pos) {
        return new Player(pos.plus(new Vector(0, -0.5)), new Vector(0, 0));
      }
    }

    // TODO replace to consts or file with Lava
    const LAVA_SIZE = new Vector(1, 1); // TODO DI of Vector?

    class Lava {
      #type = 'lava';

      #size = LAVA_SIZE;

      constructor(pos, speed, reset) {
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
      }

      get type() {
        return this.#type;
      }

      get size() {
        return this.#size;
      }

      update(time, state) {
        const newPos = this.pos.plus(this.speed.times(time));

        // TODO replace to consts
        if (!state.level.touches(newPos, this.size, 'wall')) {
          return new Lava(newPos, this.speed, this.reset);
        }
        if (this.reset) {
          return new Lava(this.reset, this.speed, this.reset);
        }
        return new Lava(this.pos, this.speed.times(-1));
      }

      // TODO DI of State
      // eslint-disable-next-line class-methods-use-this
      collide(state) {
        // TODO replace to consts
        return new State(state.level, state.actors, 'lost');
      }

      static create(pos, ch) {
        const typeMap = {
          '=': new Lava(pos, new Vector(2, 0)),
          '|': new Lava(pos, new Vector(0, 2)),
          v: new Lava(pos, new Vector(0, 3), pos),
        };

        return typeMap[ch];
      }
    }

    // TODO replace to consts or file with Coin
    const COIN_SIZE = new Vector(0.6, 0.6); // TODO DI of Vector

    class Coin {
      #type = 'coin';

      #wobbleSpeed = 8;

      #wobbleDist = 0.07;

      #size = COIN_SIZE;

      constructor(pos, basePos, wobble) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble;
      }

      get type() {
        return this.#type;
      }

      get size() {
        return this.#size;
      }

      update(time) {
        const wobble = this.wobble + time * this.#wobbleSpeed;
        const wobblePos = Math.sin(wobble) * this.#wobbleDist;

        return new Coin(
          this.basePos.plus(new Vector(0, wobblePos)),
          this.basePos, wobble,
        );
      }

      // TODO DI of State
      collide({ actors, status, level }) {
        const filtered = actors.filter(a => a !== this);
        let currentStatus = status;

        // TODO replace to consts
        if (!filtered.some(a => a.type === 'coin')) {
          currentStatus = 'won';
        }
        return new State(level, filtered, currentStatus);
      }

      static create(pos) {
        const basePosition = pos.plus(new Vector(0.2, 0.1));

        return new Coin(basePosition, basePosition, Math.random() * Math.PI * 2);
      }
    }

    const levelChars = {
      '.': 'empty',
      '#': 'wall',
      '+': 'lava',
      '=': Lava,
      '|': Lava,
      v: Lava,
      o: Coin,
      '@': Player,
    };

    // TODO DI for levelChars and Vector
    // TODO split to methods
    // TODO add comments
    class Level {
      constructor(plan) {
        const rows = plan.trim().split('\n').map(row => [...row.trim()]);

        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        this.rows = rows.map((row, y) => row.map((char, x) => {
          const type = levelChars[char];

          if (typeof type === 'string') {
            return type;
          }

          this.startActors.push(type.create(new Vector(x, y), char));
          // TODO replace to consts
          return 'empty';
        }));
      }

      touches(pos, size, type) {
        const xStart = Math.floor(pos.x);
        const xEnd = Math.ceil(pos.x + size.x);
        const yStart = Math.floor(pos.y);
        const yEnd = Math.ceil(pos.y + size.y);

        for (let y = yStart; y < yEnd; y += 1) {
          for (let x = xStart; x < xEnd; x += 1) {
            const isOutside = x < 0 || x >= this.width
              || y < 0 || y >= this.height;
            // TODO replace to consts
            const here = isOutside ? 'wall' : this.rows[y][x];

            if (here === type) {
              return true;
            }
          }
        }
        return false;
      }
    }

    // TODO add comments
    function elt(name, attrs, ...children) {
      const dom = document.createElement(name);

      for (const attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
      }
      for (const child of children) {
        dom.appendChild(child);
      }
      return dom;
    }

    // TODO replace to consts
    const scale = 20;

    // TODO DI elt
    function drawGrid(level) {
      return elt(
        'table',
        {
          class: 'background',
          style: `width: ${level.width * scale}px`,
        },
        ...level.rows.map(row => elt(
          'tr',
          { style: `height: ${scale}px` },
          ...row.map(type => elt('td', { class: type })),
        )),
      );
    }

    // TODO add comments
    // TODO DI elt
    function drawActors(actors) {
      return elt('div', {}, ...actors.map((actor) => {
        const rect = elt('div', { class: `actor ${actor.type}` });

        rect.style.width = `${actor.size.x * scale}px`;
        rect.style.height = `${actor.size.y * scale}px`;
        rect.style.left = `${actor.pos.x * scale}px`;
        rect.style.top = `${actor.pos.y * scale}px`;
        return rect;
      }));
    }

    // TODO add comments
    // TODO DI elt, drawGrid
    class DOMDisplay {
      constructor(parent, level) {
        this.dom = elt('div', { class: 'game' }, drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
      }

      clear() {
        this.dom.remove();
      }

      scrollPlayerIntoView({ player }) {
        const width = this.dom.clientWidth;
        const height = this.dom.clientHeight;
        const margin = width / 3;

        // The viewport
        const left = this.dom.scrollLeft;
        const right = left + width;
        const top = this.dom.scrollTop;
        const bottom = top + height;

        const center = player.pos
          .plus(player.size.times(0.5))
          .times(scale);

        if (center.x < left + margin) {
          this.dom.scrollLeft = center.x - margin;
        } else if (center.x > right - margin) {
          this.dom.scrollLeft = center.x + margin - width;
        }
        if (center.y < top + margin) {
          this.dom.scrollTop = center.y - margin;
        } else if (center.y > bottom - margin) {
          this.dom.scrollTop = center.y + margin - height;
        }
      }

      syncState(state) {
        if (this.actorLayer) {
          this.actorLayer.remove();
        }
        this.actorLayer = drawActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game ${state.status}`;
        this.scrollPlayerIntoView(state);
      }
    }

    // TODO add comments
    // TODO set in component
    function trackKeys(keys) {
      const down = Object.create(null);
      const track = (event) => {
        if (keys.includes(event.key)) {
          down[event.key] = event.type === 'keydown';
          event.preventDefault();
        }
      };
      window.addEventListener('keydown', track);
      window.addEventListener('keyup', track);
      return down;
    }

    const arrowKeys = trackKeys(['ArrowLeft', 'ArrowRight', 'ArrowUp']);

    // TODO add comments
    // TODO set in component
    function runAnimation(frameFunc) {
      let lastTime = null;

      function frame(time) {
        if (lastTime != null) {
          // TODO replace to consts
          const timeStep = Math.min(time - lastTime, 100) / 1000;

          if (frameFunc(timeStep) === false) {
            return;
          }
        }
        lastTime = time;
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    // TODO add comments
    const componentElement = this.$el;

    async function runLevel(level, Display) {
      const display = new Display(componentElement, level);
      let state = State.start(level);
      let ending = 1;

      return new Promise((resolve) => {
        runAnimation((time) => {
          state = state.update(time, arrowKeys);
          display.syncState(state);
          // TODO replace to consts
          if (state.status === 'playing') {
            return true;
          }
          if (ending > 0) {
            ending -= time;
            return true;
          }
          display.clear();
          resolve(state.status);
          return false;
        });
      });
    }

    // TODO add comments
    async function runGame(plans, Display) {
      for (let level = 0; level < plans.length;) {
        // TODO refactor
        // eslint-disable-next-line no-await-in-loop
        const status = await runLevel(new Level(plans[level]), Display);
        // TODO replace to consts
        if (status === 'won') {
          level += 1;
        }
      }
      await runLevel(new Level(plans[0]), Display);
      // TODO refactor
      // eslint-disable-next-line no-alert
      alert("You've won!");
    }

    runGame([simpleLevelPlan], DOMDisplay);
  },
};
</script>

<style scoped lang="less">
.canvas-wrap {}
</style>
