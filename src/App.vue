<template>
  <div id="app">
    <HelloWorld/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import { px2rem } from './utils/utils'
px2rem();

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
  body,html{
    margin: 0;
    padding: 0;
    background-color: #fff8c9;
    font-size: 0.14rem;
    -webkit-overflow-scrolling: touch;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background-color: #fff8c9;
    color: #2c3e50;
  }
</style>
