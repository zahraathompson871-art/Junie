<template>
  <div class="light-theme app-shell">
    <TopBar />
    <main class="app-content">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue'
import SiteFooter from './components/SiteFooter.vue'

export default {
  components: { TopBar, SiteFooter }
}
</script>

<style scoped>
.app-shell {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
}
</style>

