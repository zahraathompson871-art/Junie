<template>
  <div class="home">
    <!-- Hero Section -->
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

    <!-- About / Vision / Mission Section -->
    <section class="about-section py-5">
      <div class="container">
        <div class="row g-4 align-items-start">
          <!-- Left Column -->
          <div class="col-md-6 d-flex flex-column gap-4">
            <div class="about-card">
              <h3 class="section-title">About Us</h3>
              <h5 class="section-subtitle">Style & aesthetics meet functionality</h5>
              <p>
                Junie offers a fresh approach, blending style and functionality. 
                We empower creators and students with visually striking dashboards, 
                innovative tools, and a streamlined experience.
              </p>
            </div>
            <div class="about-card">
              <h3 class="section-title">Our Mission</h3>
              <h5 class="section-subtitle">Drive growth and innovation</h5>
              <p>
                Deliver affordable, high-quality digital solutions, simplify the creative journey, 
                and make innovation accessible to everyone.
              </p>
            </div>
          </div>
          <!-- Right Column -->
          <div class="col-md-6 d-flex flex-column gap-4">
            <div class="about-card image-card">
              <img 
                src="https://i.pinimg.com/1200x/17/e2/d9/17e2d95e982725742902eb2b6eb4dd33.jpg" 
                alt="About illustration" 
                class="img-fluid"
              />
            </div>
            <div class="about-card">
              <h3 class="section-title">Our Vision</h3>
              <h5 class="section-subtitle">Empowering start-ups and creators</h5>
              <p>
                To be the leading hub that transforms the creative process, redefining 
                how communities connect and grow by blending creativity and technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reasons Section -->
    <section class="reasons-section container mt-5">
      <div class="row align-items-center">
        <div class="col-md-6 text-center">
          <div class="reasons-image-placeholder">
            <img 
              src="https://i.etsystatic.com/31089580/r/il/a6cdd3/5581078661/il_1588xN.5581078661_ntxh.jpg" 
              alt="Product showcase illustration" 
              class="img-fluid rounded illustration-img"
            />
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
              <span class="product-price">R{{ p.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Growth Section -->
    <section 
  class="growth-section py-5 animate-on-scroll" 
  :class="{ visible: isCreatorVisible }" 
  ref="creatorSection"
>
  <div class="row justify-content-center align-items-center g-4">
    <!-- Left Column: Text -->
    <div class="col-md-5 text-center text-md-start">
      <h2 class="growth-title">Your brand's digital growth starts here.</h2>
      <p class="growth-subtitle">
        Empowering creators, students, and businesses through tailored tools, 
        seamless design, and motivational community features.
      </p>
      <router-link to="/creatorhub" class="btn btn-glow">Get Started</router-link>
    </div>

    <!-- Right Column: Image -->
    <div class="col-md-5">
      <div class="growth-card text-center">
        <img 
          src="https://i.etsystatic.com/40808827/r/il/e58aad/4736516361/il_1588xN.4736516361_ley8.jpg" 
          alt="Digital growth illustration" 
          class="img-fluid rounded growth-image"
        />
      </div>
    </div>
  </div>
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
      isCreatorVisible: true,
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

    // ✅ Safe checks before observing
    if (this.$refs.creatorSection) {
      observer.observe(this.$refs.creatorSection)
    }
    if (this.$refs.footerSection) {
      observer.observe(this.$refs.footerSection)
    }

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
  background-image: url('https://i.pinimg.com/736x/5e/c5/a6/5ec5a67c49658c248ce2a6fd6c901f1b.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh; 
  overflow: hidden; 
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease-out;
}


.hero-overlay {
  padding: 3rem 2rem;
  max-width: 700px;
  text-align: center;
  z-index: 2;
}

.brand-title { font-size: 2.8rem; font-weight: 900; color: #fff; }
.highlight { color: #c2beb8; }
.intro-text { margin: 1rem auto 2rem; max-width: 600px; font-size: 1.2rem; color: #ddd4d4; }
.auth-links { display: flex; justify-content: center; gap: 1rem; }

.btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
.btn-glow { background-color: #121212; color: #fff; border: none; transition: background-color 0.3s ease; }
.btn-glow:hover { background-color: #333; }
.btn-outline { border: 1px solid #fff; color: #fff; background: transparent; }
.btn-outline:hover { background-color: #fff; color: #121212; }


.reasons-section { margin-top: 3rem; }
.reasons-image-placeholder { background: #fdfdf6; border-radius: 12px; padding: 3rem; font-weight: 600; color: #121212; }
.reasons-list { list-style: none; padding: 0; }
.reasons-list li { margin-bottom: 1.5rem; }
.reasons-list h5 { font-weight: 700; color: #121212; margin-bottom: 0.5rem; }
.reasons-list p { color: #555; font-size: 0.95rem; }


.featured { margin-top: 2rem; }
.product-card { background-color: #ffffff; border: 1px solid #ddd; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.product-title { font-weight: 700; color: #121212; }
.product-description { font-size: 0.9rem; color: #555; }
.product-price { font-weight: 600; color: #121212; }


.creator-cta, .footer { text-align: center; padding: 3rem 2rem; background: #ffffff; margin-top: 2rem; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.footer { margin-top: 3rem; border-top: 1px solid #ddd; }
.footer-title { color: #121212; font-weight: 700; }
.challenge-text { margin: 1rem auto; max-width: 500px; color: #333; }

/* Scroll-trigger Animation */
.animate-on-scroll { opacity: 0; transform: translateY(40px); transition: all 0.8s ease-out; }
.animate-on-scroll.visible { opacity: 1; transform: translateY(0); }

.about-section {
  background: #fdfcf7; /* cream background */
}

.about-card {
  background: #ffffff; /* white card */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.section-title {
  color: #000;
  font-weight: 700;
  margin-bottom: 8px;
}

.section-subtitle {
  color: #333;
  font-weight: 500;
  margin-bottom: 12px;
}

.about-card p {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.about-image {
  border-radius: 8px;
  max-width: 100%;
  height: auto;
}

.gap-4 > .about-card {
  margin-bottom: 1.5rem;
}

.growth-section {
  background: #fdfcf7; /* cream background strip */
  width: 100%; /* full width */
}

.growth-card {
  background: #ffffff; /* white card */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.growth-image {
  border-radius: 8px;
  max-width: 100%;
  height: auto;
}

.growth-title {
  color: #000;
  font-weight: 700;
  margin-bottom: 15px;
}

.growth-subtitle {
  color: #333;
  margin-bottom: 20px;
}

.btn-glow {
  background: linear-gradient(90deg, #000, #333);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  transition: transform 0.2s ease;
}
.btn-glow:hover {
  transform: scale(1.05);
}

.about-card.image-card {
  padding: 0; /* remove extra padding around the image */
  overflow: hidden; /* keep image neatly inside */
  max-height: 300px; /* adjust height to match text cards */
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-card.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* crop nicely instead of stretching */
  border-radius: 12px; /* match card corners */
}

.auth-links {
  position: relative;
  z-index: 10;
}


</style>
