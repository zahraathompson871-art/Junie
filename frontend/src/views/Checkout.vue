<template>
  <div class="checkout-block">
    <h2 class="text-glow">Checkout</h2>
    <form class="checkout-form">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input v-model="customer.name" id="name" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="customer.email" id="email" type="email" required />
      </div>

      <div class="form-group">
        <label for="address">Address</label>
        <input v-model="customer.address" id="address" required />
      </div>

      <h3 class="text-glow">Order Summary</h3>
      <ul>
        <li v-for="item in cart.items" :key="item.id">
          {{ item.title }} - R{{ item.price }}
        </li>
      </ul>
      <p class="total">Total: R{{ cart.total }}</p>

      <p v-if="paymentError" class="status error">{{ paymentError }}</p>
      <p v-if="paymentSuccess" class="status success">{{ paymentSuccess }}</p>

      <div v-if="cart.items.length > 0" ref="paypalButtons" class="paypal-buttons mt-3"></div>
      <button
        v-if="cart.items.length > 0 && !paypalReady"
        type="button"
        class="btn-glow"
        @click="initPaypal"
      >
        Load PayPal
      </button>
    </form>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

export default {
  name: "Checkout",
  setup() {
    const cart = useCartStore()
    const router = useRouter()
    const customer = reactive({ name: '', email: '', address: '' })
    return { cart, router, customer }
  },
  data() {
    return {
      paypalReady: false,
      paymentError: '',
      paymentSuccess: ''
    }
  },
  async mounted() {
    if (this.cart.items.length > 0) {
      await this.initPaypal()
    }
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    getToken() {
      return localStorage.getItem('token') || ''
    },
    getPaypalCurrency() {
      return (import.meta.env.VITE_PAYPAL_CURRENCY || 'USD').toUpperCase()
    },
    async loadPaypalSdk() {
      if (window.paypal) return

      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
      if (!clientId) {
        throw new Error('Missing VITE_PAYPAL_CLIENT_ID in frontend env')
      }

      await new Promise((resolve, reject) => {
        const existing = document.getElementById('paypal-sdk-script')
        if (existing) {
          existing.addEventListener('load', resolve, { once: true })
          existing.addEventListener('error', () => reject(new Error('Failed to load PayPal SDK')), { once: true })
          return
        }

        const script = document.createElement('script')
        script.id = 'paypal-sdk-script'
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(this.getPaypalCurrency())}&intent=capture`
        script.async = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'))
        document.head.appendChild(script)
      })
    },
    async initPaypal() {
      try {
        this.paymentError = ''
        this.paymentSuccess = ''
        await this.loadPaypalSdk()
        await this.renderPaypalButtons()
        this.paypalReady = true
      } catch (err) {
        this.paymentError = err.message || 'Failed to initialize PayPal'
      }
    },
    async renderPaypalButtons() {
      if (!this.$refs.paypalButtons || !window.paypal) return

      this.$refs.paypalButtons.innerHTML = ''
      const vm = this

      await window.paypal.Buttons({
        createOrder: async () => {
          const response = await fetch(`${vm.getApiBaseUrl()}/api/paypal/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${vm.getToken()}`
            },
            body: JSON.stringify({
              cartItems: vm.cart.items,
              totalAmount: vm.cart.total
            })
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.message || 'Failed to create PayPal order')
          }

          return data.id
        },
        onApprove: async (data) => {
          const response = await fetch(`${vm.getApiBaseUrl()}/api/paypal/capture-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${vm.getToken()}`
            },
            body: JSON.stringify({
              orderID: data.orderID,
              cartItems: vm.cart.items
            })
          })

          const result = await response.json()
          if (!response.ok) {
            throw new Error(result.message || 'Failed to capture PayPal payment')
          }

          vm.paymentSuccess = 'Payment successful'
          vm.cart.clearCart()
          vm.router.push('/thankyou')
        },
        onError: (err) => {
          vm.paymentError = err?.message || 'PayPal encountered an error'
        }
      }).render(this.$refs.paypalButtons)
    }
  }
}
</script>

<style scoped>
.checkout-block {
  background: #ffffff; /* white card */
  color: #121212;      /* black text */
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: auto;
}

.text-glow {
  color: #121212; /* black accent */
  font-weight: 600;
}

.checkout-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #121212;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  background: #fdfdf6; /* cream input background */
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #121212;
}

input:focus {
  border-color: #121212;
  outline: none;
}

/* Order Summary */
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 5px 0;
  color: #121212;
}

.total {
  font-weight: bold;
  margin-top: 10px;
  color: #121212;
}

/* Buttons */
.btn-glow {
  background-color: #121212; /* black button */
  color: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}

.paypal-buttons {
  min-height: 45px;
}

.status {
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 600;
}

.status.error {
  color: #a12424;
}

.status.success {
  color: #1c7a33;
}
</style>

