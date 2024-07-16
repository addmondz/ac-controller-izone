<template>
  <div id="app">
    <AcController />
  </div>
</template>

<script>
import AcController from './components/AcController.vue';

export default {
  components: {
    AcController,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
