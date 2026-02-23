<template>
  <TopBar/>
  <router-view/>
</template>

<script>
import TopBar from './components/TopBar.vue'
export default { components: { TopBar } }
</script>
