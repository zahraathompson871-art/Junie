<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">Your Cart</h2>

      <div v-if="cart.items.length === 0" class="alert alert-dark">
        Your cart is empty.
      </div>

      <div v-else>
        <ul class="list-group mb-4">
          <li v-for="item in cart.items" :key="item.id" class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ item.title }}</strong> - R{{ item.price }}
            </div>
            <button class="btn btn-sm btn-outline-light remove-btn" @click="cart.removeItem(item.id)">
              Remove
            </button>
          </li>
        </ul>

        <h5>Total: R{{ cart.total }}</h5>
        <button class="btn btn-glow mt-3" @click="checkout">Proceed to Checkout</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()
    const checkout = () => {
      // Redirect to payment gateway (PayFast/Stripe)
      // After payment, redirect to ThankYou.vue
      window.location.href = "/thankyou"
    }
    return { cart, checkout }
  }
}
</script>

<style scoped>
.main { background-color: #0d0d0d; color: #e0e0e0; flex: 1; overflow-y: auto; }
.text-glow { color: #fff; font-weight: 600; }
.btn-glow { background-color: #9d4edd; color: #fff; border-radius: 8px; }
.remove-btn {
  border: 1px solid #e0e0e0;
  color: #e0e0e0;
  transition: background 0.3s ease, color 0.3s ease;
}
.remove-btn:hover {
  background: #e0e0e0;
  color: #121212;
}
</style>
