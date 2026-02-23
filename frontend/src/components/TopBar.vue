<template>
  <nav class="topbar">
    <!-- Left: Brand -->
    <div class="topbar-left">
      <router-link to="/" class="brand-name">Junie</router-link>
    </div>

    <!-- Center: Expanded Search -->
    <div class="topbar-center">
      <input type="text" class="search-bar" placeholder="Search...">
    </div>

    <!-- Right: Navigation + Cart -->
    <div class="topbar-right">
      <ul class="nav-links">
        <li><router-link to="/dashboard" class="nav-link">Dashboard</router-link></li>
        <li><router-link to="/marketplace" class="nav-link">Marketplace</router-link></li>
        <li><router-link to="/creatorhub" class="nav-link">CreatorHub</router-link></li>
        <li class="profile-cart">
          <router-link to="/profile" class="nav-link">Profile</router-link>
          <!-- Cart Icon next to Profile -->
          <div class="cart-icon" @click="$router.push('/cart')">
            🛒
            <span v-if="cart.count > 0" class="cart-count">{{ cart.count }}</span>
          </div>
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
  }
}
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff; /* white bar */
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.brand-name {
  color: #121212; /* black text */
  font-weight: 900;
  letter-spacing: 1px;
  text-decoration: none;
}
.brand-name:hover {
  color: #333; /* darker hover */
}

.search-bar {
  width: 100%;
  max-width: 600px;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #fdfdf6; /* cream input background */
  color: #121212;
}
.search-bar:focus {
  border-color: #121212;
  outline: none;
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
  margin-left: 1rem;
  color: #121212; /* black text */
  text-decoration: none;
  transition: color 0.3s ease;
}
.nav-link:hover {
  color: #333; /* darker hover */
}

.profile-cart {
  display: flex;
  align-items: center;
}

.cart-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  position: relative;
  font-size: 1.2rem;
  color: #121212; /* black icon */
}
.cart-count {
  background: #121212; /* black badge */
  color: #fff;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  position: absolute;
  top: -8px;
  right: -10px;
}
</style>
