<template>
  <div class="main">
    <div class="container mt-4 text-center">
      <h2 class="text-glow mb-4">Thank You!</h2>
      <p v-if="error" class="status error">{{ error }}</p>
      <p v-else-if="loading">Confirming your payment...</p>
      <p v-else>{{ successMessage }}</p>

      <router-link to="/dashboard" class="btn btn-glow">Go to Dashboard</router-link>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()
    return { cart }
  },
  data() {
    return {
      loading: true,
      error: '',
      successMessage: 'Your payment was successful.'
    }
  },
  async mounted() {
    const sessionId = this.$route?.query?.session_id
    const token = localStorage.getItem('token') || ''
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    if (!sessionId) {
      this.loading = false
      this.error = 'Missing Stripe session id.'
      return
    }

    try {
      const response = await fetch(`${apiBase}/api/stripe/confirm-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment.')
      }
      if (data.mode === 'subscription') {
        this.successMessage = 'Your subscription is active. You can now apply all templates.'
      } else {
        this.successMessage = 'Your payment was successful and templates are unlocked.'
      }
      this.cart.clearCart()
    } catch (err) {
      this.error = err.message || 'Failed to confirm payment.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.main {
  background-color: #fdfdf6;
  color: #121212;
  flex: 1;
  overflow-y: auto;
  min-height: 100vh;
}

.text-glow {
  color: #121212;
  font-weight: 600;
}

.container {
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 600px;
}

.btn-glow {
  background-color: #121212;
  color: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.status.error {
  color: #a12424;
  font-weight: 600;
}
</style>
