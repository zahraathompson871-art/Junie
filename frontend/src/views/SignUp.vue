<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Create Your <span class="highlight">Junie</span> Account</h2>
      <form @submit.prevent="signup" class="auth-form">
        <input 
          type="text" 
          placeholder="Name" 
          v-model="name" 
          class="auth-input" 
          required
        />
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
        <button type="submit" class="btn btn-glow">Sign Up</button>
      </form>
      <p class="auth-footer">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { 
      name: '', 
      email: '', 
      password: '' 
    }
  },
  methods: {
    signup() {
      if (this.name && this.email && this.password) {
        const newUser = {
          id: Date.now(),
          name: this.name,
          email: this.email,
          password: this.password, // ✅ store password for login check
          bio: '',
          avatar: '',
          isProfileComplete: false // ✅ new users must complete profile
        }

        localStorage.setItem('user', JSON.stringify(newUser))
        alert(`Account created for ${newUser.name}!`)

        // Redirect to CreateAccount so they can finish setup
        this.$router.push({ name: 'CreateAccount' })
      } else {
        alert("Please fill in all fields")
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
  background-color: #fdfdf6; /* cream background */
}

.auth-card {
  background: #ffffff; /* white card */
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
  color: #121212; /* black text */
}

.highlight {
  color: #121212; /* black accent */
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
  background-color: #fdfdf6; /* cream input background */
  color: #121212;
}

.auth-input:focus {
  border-color: #121212;
  outline: none;
}

/* Buttons */
.btn {
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-glow {
  background-color: #121212; /* black button */
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}

/* Footer */
.auth-footer {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555;
}
.auth-footer a {
  color: #121212; /* black link */
  text-decoration: none;
  font-weight: 600;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>
