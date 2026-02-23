<template>
  <div class="home">
    <!-- Hero Section with background -->
    <section class="hero hero-background" :class="{ faded: isHeroFaded }" ref="heroSection">
  <div class="hero-overlay">
    <h1 class="brand-title">Welcome to <span class="highlight">Junie</span></h1>
    <p class="intro-text">
      Junie is your hub for creators, students, and innovators. 
      Discover digital tools, showcase your talent, and join a global community.
    </p>
    <div class="auth-links">
      <router-link to="/login" class="btn btn-glow">Login</router-link>
      <router-link to="/signup" class="btn btn-outline">Sign Up</router-link>
    </div>
  </div>
</section>


    <!-- Digital Growth Section -->
    <section class="growth-section container mt-5">
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <h2 class="growth-title">Your brand's digital growth starts here.</h2>
          <p class="growth-subtitle">
            Empowering creators, students, and businesses through tailored tools, 
            seamless design, and motivational community features.
          </p>
          <router-link to="/creatorhub" class="btn btn-glow">Get Started</router-link>
        </div>
        <div class="col-md-6 illustration-block text-center">
          <div class="illustration-placeholder">
            🎨 Illustration / Graphic Area
          </div>
        </div>
      </div>
    </section>

    <!-- About / Vision / Mission Section -->
    <section class="about-section container mt-5">
      <div class="row g-4">
        <div class="col-md-4 about-card">
          <h3 class="section-title">About Us</h3>
          <h5 class="section-subtitle">Style & aesthetics meet functionality</h5>
          <p>
            Junie offers a fresh approach, blending style and functionality. 
            We empower creators and students with visually striking dashboards, 
            innovative tools, and a streamlined experience.
          </p>
        </div>
        <div class="col-md-4 about-card">
          <h3 class="section-title">Our Vision</h3>
          <h5 class="section-subtitle">Empowering start-ups and creators</h5>
          <p>
            To be the leading hub that transforms the creative process, redefining 
            how communities connect and grow by blending creativity and technology.
          </p>
        </div>
        <div class="col-md-4 about-card">
          <h3 class="section-title">Our Mission</h3>
          <h5 class="section-subtitle">Drive growth and innovation</h5>
          <p>
            Deliver affordable, high-quality digital solutions, simplify the creative journey, 
            and make innovation accessible to everyone.
          </p>
        </div>
      </div>
    </section>

    <!-- Reasons to Love Junie Section -->
    <section class="reasons-section container mt-5">
      <div class="row align-items-center">
        <div class="col-md-6 text-center">
          <div class="reasons-image-placeholder">
            🛍️ Product Showcase / Lifestyle Graphic
          </div>
        </div>
        <div class="col-md-6">
          <h2 class="text-glow mb-4">Reasons to love Junie</h2>
          <ul class="reasons-list">
            <li>
              <h5>Plenty of incredible products</h5>
              <p>From study planners to fitness dashboards, Junie makes it easy to find extraordinary digital tools.</p>
            </li>
            <li>
              <h5>For every occasion</h5>
              <p>Whether you’re studying, creating, or building a business, Junie has something for every stage of growth.</p>
            </li>
            <li>
              <h5>Tips and inspiration</h5>
              <p>Our community sparks fresh ideas with challenges, showcases, and motivational features.</p>
            </li>
          </ul>
        </div>
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
    <section 
      class="creator-cta animate-on-scroll" 
      :class="{ 'visible': isCreatorVisible }" 
      ref="creatorSection"
    >
      <h2 class="text-glow">Become a Creator</h2>
      <p>
        Share your designs, templates, and digital products with the world. 
        Junie empowers creators to grow, connect, and inspire.
      </p>
      <router-link to="/creatorhub" class="btn btn-glow">Join CreatorHub</router-link>
    </section>

    <!-- Footer Challenge -->
    <footer 
      class="footer animate-on-scroll" 
      :class="{ 'visible': isFooterVisible }" 
      ref="footerSection"
    >
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
    return { 
      user,
      isCreatorVisible: false,
      isFooterVisible: false,
      isHeroFaded: false
    }
  },
  mounted() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === this.$refs.creatorSection) {
          this.isCreatorVisible = entry.isIntersecting
        }
        if (entry.target === this.$refs.footerSection) {
          this.isFooterVisible = entry.isIntersecting
        }
      })
    }, { threshold: 0.2 })

    observer.observe(this.$refs.creatorSection)
    observer.observe(this.$refs.footerSection)

    window.addEventListener('scroll', () => {
      this.isHeroFaded = window.scrollY > 100
    })
  }
}
</script>

<style scoped>
.home { 
  background-color: #fdfdf6; 
  color: #121212; 
  width: 100%; 
  min-height: 100vh;
  overflow-x: hidden; 
  overflow-y: visible; 
  display: block;
}


.hero-background {
  position: relative;
  background-image: url('https://tecno-oficinas.com/img/ybc_blog/post/homeoffice.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh; 
  overflow: hidden;  
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease-out;
}

.hero-background.faded { 
  opacity: 0; 
  pointer-events: none; 
}

/* Overlay without white box */
.hero-overlay {
  padding: 3rem 2rem;
  max-width: 700px;
  text-align: center;
  z-index: 2;
}

/* Hero text */
.brand-title { font-size: 2.8rem; font-weight: 900; color: #fff; }
.highlight { color: #c2beb8; }
.intro-text { margin: 1rem auto 2rem; max-width: 600px; font-size: 1.2rem; color: #ddd4d4; }
.auth-links { display: flex; justify-content: center; gap: 1rem; }

/* Buttons */
.btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
.btn-glow { background-color: #121212; color: #fff; border: none; transition: background-color 0.3s ease; }
.btn-glow:hover { background-color: #333; }
.btn-outline { border: 1px solid #fff; color: #fff; background: transparent; }
.btn-outline:hover { background-color: #fff; color: #121212; }

/* Growth Section */
.growth-section { background: #ffffff; border: 1px solid #ddd; border-radius: 12px; padding: 3rem 2rem; margin-top: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.growth-title { font-size: 1.8rem; font-weight: 700; color: #121212; margin-bottom: 1rem; }
.growth-subtitle { font-size: 1rem; color: #555; margin-bottom: 1.5rem; }
.illustration-block { display: flex; justify-content: center; align-items: center; }
.illustration-placeholder { background: #fdfdf6; border: 2px dashed #121212; border-radius: 12px; padding: 3rem; font-weight: 600; color: #121212; }

/* About Section */
.about-section { margin-top: 3rem; }
.about-card { background: #ffffff; border: 1px solid #ddd; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
.section-title { font-weight: 700; margin-bottom: 0.5rem; color: #121212; }
.section-subtitle { font-weight: 600; color: #333; margin-bottom: 1rem; }
.about-card p { color: #555; font-size: 0.95rem; }

/* Reasons Section */
.reasons-section { margin-top: 3rem; }
.reasons-image-placeholder { background: #fdfdf6; border: 2px dashed #121212; border-radius: 12px; padding: 3rem; font-weight: 600; color: #121212; }
.reasons-list { list-style: none; padding: 0; }
.reasons-list li { margin-bottom: 1.5rem; }
.reasons-list h5 { font-weight: 700; color: #121212; margin-bottom: 0.5rem; }
.reasons-list p { color: #555; font-size: 0.95rem; }

/* Featured Products */
.featured { margin-top: 2rem; }
.product-card { background-color: #ffffff; border: 1px solid #ddd; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.product-title { font-weight: 700; color: #121212; }
.product-description { font-size: 0.9rem; color: #555; }
.product-price { font-weight: 600; color: #121212; }

/* Creator CTA & Footer */
.creator-cta, .footer { text-align: center; padding: 3rem 2rem; background: #ffffff; margin-top: 2rem; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.footer { margin-top: 3rem; border-top: 1px solid #ddd; }
.footer-title { color: #121212; font-weight: 700; }
.challenge-text { margin: 1rem auto; max-width: 500px; color: #333; }

/* Scroll-trigger Animation */
.animate-on-scroll { opacity: 0; transform: translateY(40px); transition: all 0.8s ease-out; }
.animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
</style>
