<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Login to <span class="highlight">Junie</span></h2>
      <form @submit.prevent="login" class="auth-form">
        <input 
          type="email" 
          placeholder="Email" 
          v-model="email" 
          class="auth-input" 
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          v-model="password" 
          class="auth-input" 
          required
        />
        <button type="submit" class="btn btn-glow">Login</button>
      </form>
      <p class="auth-footer">
        Don’t have an account? <router-link to="/signup">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { 
      email: '', 
      password: '' 
    }
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    async login() {
      try{
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/login`,{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })
        const data = await response.json()
      
        if (response.ok) {
          localStorage.setItem('token', data.token)
          this.$router.push({ name: 'Dashboard' })
        } else {
          alert(data.error)
        }
      }catch (err){
        alert('Network error. Please try again.')
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
  height: 100vh; 
  background-color: #fdfdf6; 
}

.auth-card {
  background: #ffffff; 
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #121212; 
}

.highlight {
  color: #121212; 
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-input {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #fdfdf6; 
  color: #121212;
}

.auth-input:focus {
  border-color: #121212;
  outline: none;
}

.btn {
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-glow {
  background-color: #121212; 
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}

.auth-footer {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555;
}
.auth-footer a {
  color: #121212; 
  text-decoration: none;
  font-weight: 600;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>


