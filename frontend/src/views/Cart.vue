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

      <!-- Suggested Products -->
      <div class="suggested-block mt-5">
        <h2 class="text-glow">Other Products You May Like</h2>
        <div class="suggested-products d-flex flex-wrap">
          <div v-for="product in suggested" :key="product.id" class="suggested-item p-3 m-2">
            <img :src="product.image" alt="Suggested product" class="product-img mb-2" />
            <h5>{{ product.title }}</h5>
            <p>R{{ product.price }}</p>
            <button class="btn btn-sm btn-glow" @click="cart.addItem(product)">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import user from '../data/mockUser.js'

export default {
  setup() {
    const cart = useCartStore()
    const router = useRouter()

    const suggested = computed(() => {
      const inCartIds = new Set(cart.items.map(item => item.id))
      const candidates = [...user.products.trending, ...user.products.all]

      const uniqueById = new Map()
      for (const product of candidates) {
        if (!uniqueById.has(product.id) && !inCartIds.has(product.id)) {
          uniqueById.set(product.id, product)
        }
      }

      return Array.from(uniqueById.values()).slice(0, 4)
    })

    const checkout = () => {
      router.push('/checkout')
    }

    return { cart, suggested, checkout }
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

/* Cart + Suggested Blocks */
.cart-block, .suggested-block {
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

/* Suggested Products */
.suggested-products {
  display: flex;
  flex-wrap: wrap;
}
.suggested-item {
  width: 200px;
  background-color: #ffffff; /* white card */
  border-radius: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #121212;
}
.suggested-item h5 {
  font-weight: 600;
}
.suggested-item p {
  color: #555;
}
</style>
