import { PLAYER_CONFIG, LAVA_CONFIG } from '@/consts';

// TODO add comments
export default class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  static get statusMap() {
    return {
      playing: 'playing',
      lost: 'lost',
      won: 'won',
    };
  }

  static start(level) {
    return new State(level, level.startActors, State.statusMap.playing);
  }

  static overlap(actor1, actor2) {
    return actor1.pos.x + actor1.size.x > actor2.pos.x
      && actor1.pos.x < actor2.pos.x + actor2.size.x
      && actor1.pos.y + actor1.size.y > actor2.pos.y
      && actor1.pos.y < actor2.pos.y + actor2.size.y;
  }

  get player() {
    return this.actors.find(a => a.type === PLAYER_CONFIG.TYPE);
  }

  update(time, keys) {
    const actors = this.actors
      .map(actor => actor.update(time, this, keys));
    let newState = new State(this.level, actors, this.status);

    if (newState.status !== State.statusMap.playing) {
      return newState;
    }
    const { player } = newState;

    if (this.level.touches(player.pos, player.size, LAVA_CONFIG.TYPE)) {
      return new State(this.level, actors, State.statusMap.lost);
    }

    for (const actor of actors) {
      if (actor !== player && State.overlap(actor, player)) {
        newState = actor.collide(newState);
      }
    }
    return newState;
  }
}
