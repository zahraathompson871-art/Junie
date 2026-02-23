<template>
  <div class="main">
    <div class="container mt-4 text-center">
      <h2 class="text-glow mb-4">Thank You!</h2>
      <p>Your payment was successful 🎉</p>

      <h5 class="mt-4">Download Your Products:</h5>
      <ul class="list-group mb-4">
        <li class="list-group-item bg-dark text-light">
          <a href="/downloads/study-planner.pdf" download>📥 Study Planner Template</a>
        </li>
        <li class="list-group-item bg-dark text-light">
          <a href="/downloads/fitness-dashboard.pdf" download>📥 Fitness Dashboard</a>
        </li>
      </ul>

      <router-link to="/dashboard" class="btn btn-glow">Go to Dashboard</router-link>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.main {
  background-color: #fdfdf6; /* cream background */
  color: #121212;            /* black text */
  flex: 1;
  overflow-y: auto;
  min-height: 100vh;
}

.text-glow {
  color: #121212; /* black accent */
  font-weight: 600;
}

.container {
  background: #ffffff; /* white card */
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 600px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.list-group-item {
  background-color: #fdfdf6; /* cream item background */
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 0.75rem;
  text-align: left;
}

.list-group-item a {
  color: #121212;
  text-decoration: none;
  font-weight: 600;
}

.list-group-item a:hover {
  text-decoration: underline;
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
  transition: background-color 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}
</style>

