<template>
  <div id="app" class="app">
    <router-view/>
  </div>
</template>

<style lang="less">
.app {}

// TODO refactor
.background {
  table-layout: fixed;
  border-spacing: 0;
  background-color: cornflowerblue;
}
.background td {
  padding: 0;
}
.lava {
  background-color: coral;
}
.wall {
  background-color: whitesmoke;
}
.actor {
  position: absolute;
}
.coin {
  background-color: gold;
}
.player {
  background-color: wheat;
}
.lost .player {
  background-color: indianred;
}
.won .player {
  box-shadow: -4px -7px 8px white, 4px -7px 8px white;
}
.game {
  position: relative;
  max-width: 600px;
  max-height: 450px;
  overflow: hidden;
}
</style>
