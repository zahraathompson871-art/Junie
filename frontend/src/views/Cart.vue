<template>
  <div class="main">
    <div class="container mt-4">
      <div class="cart-block">
        <h2 class="text-glow mb-4">Your Cart</h2>

        <!-- Empty Cart -->
        <div v-if="cart.items.length === 0" class="alert alert-dark">
          Your cart is empty.
        </div>

        <!-- Cart Items -->
        <div v-else>
          <ul class="list-group mb-4">
            <li v-for="item in cart.items" :key="item.id" 
                class="list-group-item cart-item d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <img :src="item.image" alt="Product image" class="product-img me-3" />
                <div>
                  <strong>{{ item.title }}</strong> - R{{ item.price }}
                </div>
              </div>
              <button class="btn btn-sm btn-outline-light remove-btn" @click="cart.removeItem(item.id)">
                Remove
              </button>
            </li>
          </ul>

          <h5 class="total">Total: R{{ cart.total }}</h5>
          <button class="btn btn-glow mt-3" @click="checkout">Proceed to Checkout</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()
    const router = useRouter()

    const checkout = () => {
      router.push('/checkout')
    }

    return { cart, checkout }
  }
}
</script>

<style scoped>
.main {
  background-color: #fdfdf6; /* cream background */
  color: #121212;            /* black text */
  flex: 1;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* Cart Block */
.cart-block {
  background-color: #ffffff; /* white cards */
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.text-glow {
  color: #121212; /* black accent */
  font-weight: 600;
}

/* Cart Items */
.list-group-item.cart-item {
  background-color: #fdfdf6; /* cream item background */
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  color: #121212;
}

.product-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.total {
  font-weight: bold;
  color: #121212;
}

/* Buttons */
.btn-glow {
  background-color: #121212; /* black button */
  color: #fff;
  border-radius: 8px;
  transition: background 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}

.remove-btn {
  border: 1px solid #121212;
  color: #121212;
  transition: background 0.3s ease, color 0.3s ease;
}
.remove-btn:hover {
  background: #121212;
  color: #fff;
}

</style>
