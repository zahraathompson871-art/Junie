<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">Creator Hub</h2>

      <!-- Seller Application -->
      <div class="section p-3 mb-4">
        <h5>Apply to Become a Seller</h5>
        <p class="text-muted">Join Junie as a digital entrepreneur and start selling your creations.</p>
        <input class="form-control mb-2" placeholder="Full Name">
        <input class="form-control mb-2" placeholder="Email">
        <textarea class="form-control mb-2" placeholder="Tell us about your skills and products"></textarea>
        <button class="btn btn-glow">Submit Application</button>
      </div>

      <!-- Publish Form -->
      <div class="section p-3 mb-4">
        <h5>Publish Your Creation</h5>
        <input class="form-control mb-2" placeholder="Title">
        <textarea class="form-control mb-2" placeholder="Description"></textarea>
        <input type="file" class="form-control mb-2">
        <button class="btn btn-glow">Publish</button>
      </div>

      <!-- My Creations -->
      <h4 class="text-light">My Creations</h4>
      <div class="row g-4 mb-4">
        <div class="col-md-4" v-for="p in myProducts" :key="p.id">
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

      <!-- Global Creators -->
      <h4 class="text-light">Global Creators</h4>
      <div class="row g-4 mb-4">
        <div class="col-md-4" v-for="p in globalProducts" :key="p.id">
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

      <!-- Analytics -->
      <h4 class="text-light">Analytics</h4>
      <div class="analytics d-flex gap-3 mb-4">
        <div class="stat-card flex-fill text-center">
          <h3>{{ analytics.views }}</h3>
          <p>Views</p>
        </div>
        <div class="stat-card flex-fill text-center">
          <h3>{{ analytics.sales }}</h3>
          <p>Sales</p>
        </div>
        <div class="stat-card flex-fill text-center">
          <h3>{{ analytics.downloads }}</h3>
          <p>Downloads</p>
        </div>
      </div>

      <!-- Collabs/Partners -->
      <h4 class="text-light">Collabs & Partners</h4>
      <div class="section p-3 mb-4">
        <p class="text-muted">Connect with other creators for collaborations and partnerships.</p>
        <button class="btn btn-glow">Find Collaborators</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      myProducts: [
        {id:1,title:"My Study Template",price:5,description:"A template to organize your study sessions.",image:"https://via.placeholder.com/300x150?text=My+Template"}
      ],
      globalProducts: [
        {id:2,title:"Global Branding Kit",price:10,description:"A kit for consistent branding across platforms.",image:"https://via.placeholder.com/300x150?text=Global+Kit"},
        {id:3,title:"Fitness Dashboard",price:12,description:"Track workouts and progress with this dashboard.",image:"https://via.placeholder.com/300x150?text=Fitness+Dashboard"}
      ],
      analytics: {
        views: 1200,
        sales: 85,
        downloads: 300
      }
    }
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
.section {
  background-color: #121212;
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
}
.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.product-image {
  background-color: #121212;
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  padding: 0.5rem;
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
}
.product-price {
  font-weight: 700;
  color: #1f0c27;
}
.analytics {
  margin-top: 1rem;
}
.stat-card {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
}
.stat-card h3 {
  color: #140b1b;
  margin: 0;
}
</style>
