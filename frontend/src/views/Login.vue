<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Login to <span class="highlight">Junie</span></h2>
      <form @submit.prevent="login" class="auth-form">
        <input type="email" placeholder="Email" v-model="email" class="auth-input" />
        <input type="password" placeholder="Password" v-model="password" class="auth-input" />
        <button type="submit" class="btn btn-glow">Login</button>
      </form>
      <p class="auth-footer">
        Don’t have an account? <router-link to="/signup">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import mockUser from '../data/mockUser.js'

export default {
  data() {
    return { email: '', password: '' }
  },
  methods: {
    login() {
      if (this.email === mockUser.email && this.password) {
        localStorage.setItem('user', JSON.stringify(mockUser))
        this.$router.push({ name: 'Dashboard' })
      } else {
        alert("Invalid login details")
      }
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* full screen height */
  background-color: #0d0d0d; /* Junie dark background */
}

.auth-card {
  background: #121212;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #fff;
}

.highlight {
  color: #9d4edd; /* Junie purple accent */
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-input {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.btn {
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-glow {
  background-color: #9d4edd;
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-glow:hover {
  background-color: #7a2fc4;
}

.auth-footer {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #ccc;
}

.auth-footer a {
  color: #9d4edd;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
