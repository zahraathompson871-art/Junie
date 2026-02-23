<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">Trending Products</h2>
      <div class="row g-4 mb-4">
        <div class="col-md-4" v-for="p in user.products.trending" :key="p.id">
          <div class="product-card">
            <div class="product-image">
              <img :src="p.image" :alt="p.title" class="img-fluid rounded"/>
              <!-- Full overlay button -->
              <div class="overlay">
                <button class="btn btn-glow overlay-btn" @click="addToCart(p)">
                  Add to Cart
                </button>
              </div>
            </div>
            <div class="product-details mt-2 text-center">
              <h6 class="product-title">{{ p.title }}</h6>
              <p class="product-description text-muted">{{ p.description }}</p>
              <span class="product-price">R{{ p.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-glow mb-4">All Products</h2>
      <div class="row g-4">
        <div class="col-md-3" v-for="p in user.products.all" :key="p.id">
          <div class="product-card">
            <div class="product-image">
              <img :src="p.image" :alt="p.title" class="img-fluid rounded"/>
              <!-- Full overlay button -->
              <div class="overlay">
                <button class="btn btn-glow overlay-btn" @click="addToCart(p)">
                  Add to Cart
                </button>
              </div>
            </div>
            <div class="product-details mt-2 text-center">
              <h6 class="product-title">{{ p.title }}</h6>
              <p class="product-description text-muted">{{ p.description }}</p>
              <span class="product-price">R{{ p.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import user from '../data/mockUser.js'
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()

    const addToCart = (product) => {
      cart.addItem(product)
      alert(`${product.title} added to cart!`)
    }

    return { user, cart, addToCart }
  }
}
</script>


<style scoped>
.main {
  flex: 1;
  overflow-y: auto;
  background-color: #0d0d0d;
  color: #e0e0e0;
}
.text-glow {
  color: #ffffff;
  font-weight: 600;
}
.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.product-image {
  position: relative;
  background-color: #121212;
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  overflow: hidden;
}
.product-image img {
  width: 100%;
  border-radius: 12px;
  display: block;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6); /* semi-transparent overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.product-image:hover .overlay {
  opacity: 1; /* show overlay on hover */
}
.overlay-btn {
  background-color: #1f102c;
  color: #fff;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
}
.product-details {
  color: #e0e0e0;
}
.product-title {
  font-weight: 600;
  color: #ffffff;
}
.product-description {
  font-size: 0.9rem;
  margin: 0.5rem 0;
}
.product-price {
  font-weight: 700;
  color: #2d1138;
}
</style>
