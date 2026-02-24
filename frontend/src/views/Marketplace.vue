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
  background-color: #fdfdf6; /* cream background */
  color: #121212;            /* black text */
}

.text-glow {
  color: #121212;
  font-weight: 600;
}

/* Product Card */
.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-image {
  position: relative;
  background-color: #ffffff; /* white card */
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.product-image img {
  width: 100%;
  border-radius: 12px;
  display: block;
}

/* Overlay */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(253, 253, 246, 0.8); /* cream overlay */
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
  background-color: #121212; /* black button */
  color: #fff;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.overlay-btn:hover {
  background-color: #333;
}

/* Product Details */
.product-details {
  color: #121212;
}
.product-title {
  font-weight: 600;
  color: #121212;
}
.product-description {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  color: #555;
}
.product-price {
  font-weight: 700;
  color: #121212;
}
</style>
