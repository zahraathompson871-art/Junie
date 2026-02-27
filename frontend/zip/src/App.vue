<template>
  <div class="light-theme app-shell">
    <TopBar />
    <main class="app-content">
      <router-view />
    </main>
    <SiteFooter />
    <OnboardingTour
      v-model="showOnboardingTour"
      @completed="markTourCompleted"
    />
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import OnboardingTour from './components/OnboardingTour.vue'

export default {
  components: { TopBar, SiteFooter, OnboardingTour },
  data() {
    return {
      showOnboardingTour: false
    }
  },
  mounted() {
    this.maybeOpenTour()
    window.addEventListener('open-onboarding-tour', this.openTour)
  },
  beforeUnmount() {
    window.removeEventListener('open-onboarding-tour', this.openTour)
  },
  watch: {
    '$route.name'() {
      this.maybeOpenTour()
    }
  },
  methods: {
    isNewUser() {
      const token = localStorage.getItem('token')
      const completed = localStorage.getItem('junieOnboardingCompleted') === '1'
      return !!token && !completed
    },
    openTour() {
      if (!this.isNewUser()) return
      this.showOnboardingTour = true
    },
    maybeOpenTour() {
      if (!this.isNewUser()) return
      this.showOnboardingTour = true
    },
    markTourCompleted() {
      localStorage.setItem('junieOnboardingCompleted', '1')
      this.showOnboardingTour = false
    }
  }
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

