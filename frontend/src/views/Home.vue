<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <h1 class="brand-title">Welcome to <span class="highlight">Junie</span></h1>
      <p class="intro-text">
        Junie is your hub for creators, students, and innovators. 
        Discover digital tools, showcase your talent, and join a global community.
      </p>
      <div class="auth-links">
        <router-link to="/login" class="btn btn-glow">Login</router-link>
        <router-link to="/signup" class="btn btn-outline">Sign Up</router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured container mt-4">
      <h2 class="text-glow mb-4">Trending Products</h2>
      <div class="row g-4 mb-4">
        <div class="col-md-4" v-for="p in user.products.trending" :key="p.id">
          <div class="product-card">
            <div class="product-image">
              <img :src="p.image" :alt="p.title" class="img-fluid rounded"/>
            </div>
            <div class="product-details mt-2 text-center">
              <h6 class="product-title">{{ p.title }}</h6>
              <p class="product-description text-muted">{{ p.description }}</p>
              <span class="product-price">R{{ p.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Creator Call-to-Action -->
    <section class="creator-cta">
      <h2 class="text-glow">Become a Creator</h2>
      <p>
        Share your designs, templates, and digital products with the world. 
        Junie empowers creators to grow, connect, and inspire.
      </p>
      <router-link to="/creatorhub" class="btn btn-glow">Join CreatorHub</router-link>
    </section>

    <!-- Footer Challenge -->
    <footer class="footer">
      <h3 class="footer-title">🔥 Weekly Challenge</h3>
      <p class="challenge-text">
        This week’s challenge: Upload your best productivity template and 
        stand a chance to be featured on the Dashboard!
      </p>
      <router-link to="/signup" class="btn btn-outline">Take the Challenge</router-link>
    </footer>
  </div>
</template>

<script>
import user from '../data/mockUser.js'

export default {
  data() {
    return { user }
  }
}
</script>

<style scoped>
.home {
  background-color: #0d0d0d;
  color: #e0e0e0;
  flex: 1;
  overflow-y: auto;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 4rem 2rem;
}
.brand-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
}
.highlight {
  color: #1b0b28;
}
.intro-text {
  margin: 1rem auto 2rem;
  max-width: 600px;
  font-size: 1.1rem;
  color: #ccc;
}
.auth-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}
.btn-glow {
  background-color: #160822;
  color: #fff;
}
.btn-outline {
  border: 1px solid #1d082e;
  color: #9d4edd;
}
.btn-outline:hover {
  background-color: #1b0b29;
  color: #fff;
}

/* Creator CTA */
.creator-cta {
  text-align: center;
  padding: 3rem 2rem;
  background: #121212;
  margin-top: 2rem;
  border-radius: 12px;
}

/* Footer Challenges */
.footer {
  text-align: center;
  padding: 2rem;
  background: #1a1a1a;
  margin-top: 3rem;
}
.footer-title {
  color: #fff;
  font-weight: 700;
}
.challenge-text {
  margin: 1rem auto;
  max-width: 500px;
  color: #ccc;
}
</style>
