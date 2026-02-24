<template>
  <div class="light-theme">
    <TopBar />
    <router-view />
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue'

export default {
  components: { TopBar }
}
</script>

