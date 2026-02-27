<template>
  <nav class="topbar">
    <div class="topbar-left">
      <router-link to="/" class="brand-name" data-tour="brand">Junie</router-link>
    </div>

    <div class="topbar-right">
      <ul v-if="isHomePage" class="nav-links">
        <li><router-link to="/login" class="nav-link">Login</router-link></li>
        <li><router-link to="/signup" class="nav-link">Sign Up</router-link></li>
      </ul>

      <ul v-else class="nav-links">
        <li><router-link to="/dashboard" class="nav-link" data-tour="nav-dashboard">Dashboard</router-link></li>
        <li><router-link to="/notebooks" class="nav-link" data-tour="nav-notebooks">Notebooks</router-link></li>
        <li><router-link to="/marketplace" class="nav-link" data-tour="nav-marketplace">Marketplace</router-link></li>
        <li class="profile-cart">
          <button
            v-if="isNewUser"
            class="tour-btn"
            type="button"
            @click="openTour"
            data-tour="tour-trigger"
          >
            Tour
          </button>
          <router-link to="/profile" class="nav-link" data-tour="nav-profile">Profile</router-link>
          <button
            class="cart-icon"
            type="button"
            aria-label="Open cart"
            data-tour="nav-cart"
            @click="$router.push('/cart')"
          >
            Cart
            <span v-if="cart.count > 0" class="cart-count">{{ cart.count }}</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()
    return { cart }
  },
  computed: {
    isHomePage() {
      return this.$route?.name === 'Home'
    },
    isNewUser() {
      const token = localStorage.getItem('token')
      const completed = localStorage.getItem('junieOnboardingCompleted') === '1'
      return !!token && !completed
    }
  },
  methods: {
    openTour() {
      window.dispatchEvent(new Event('open-onboarding-tour'))
    }
  }
}
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.78);
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #dbe3ff;
  position: sticky;
  top: 0;
  z-index: 1000;
  gap: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 14px rgba(26, 41, 84, 0.06);
}

.brand-name {
  color: #1c2446;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.brand-name:hover {
  color: #4a6cff;
}

.search-bar {
  width: 100%;
  min-width: 280px;
  padding: 0.58rem 0.75rem;
  border-radius: 12px;
  border: 1px solid #dbe3ff;
  background-color: rgba(255, 255, 255, 0.8);
  color: #202a4f;
}

.search-bar:focus {
  border-color: #9eb2ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 108, 255, 0.14);
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.nav-link {
  margin-left: 0.75rem;
  color: #5c6a95;
  text-decoration: none;
  transition: color 0.18s ease, background 0.18s ease;
  font-weight: 600;
  border-radius: 999px;
  padding: 0.36rem 0.72rem;
}

.nav-link:hover {
  color: #24315e;
  background: #eef3ff;
}

.nav-link.router-link-active {
  color: #fff;
  background: linear-gradient(135deg, #4a6cff, #5f7cff);
}

.profile-cart {
  display: flex;
  align-items: center;
}

.tour-btn {
  margin-left: 0.75rem;
  border: 1px solid #ccdbff;
  background: #eef4ff;
  color: #2f457f;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.tour-btn:hover {
  background: #e7efff;
}

.cart-icon {
  margin-left: 0.75rem;
  cursor: pointer;
  position: relative;
  font-size: 0.88rem;
  color: #2c3a6d;
  border: 1px solid #ccdbff;
  border-radius: 999px;
  padding: 6px 12px;
  background: #f4f8ff;
  font-weight: 600;
  line-height: 1.2;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.cart-icon:hover {
  border-color: #aac3ff;
  background: #edf4ff;
}

.cart-icon:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 108, 255, 0.18);
}

.cart-count {
  background: linear-gradient(135deg, #4a6cff, #7c8dff);
  color: #fff;
  border-radius: 50%;
  padding: 0.12rem 0.38rem;
  font-size: 0.72rem;
  position: absolute;
  top: -8px;
  right: -8px;
}

@media (max-width: 900px) {
  .topbar {
    flex-wrap: wrap;
  }
}
</style>
