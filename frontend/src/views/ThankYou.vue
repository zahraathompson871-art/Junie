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
.main { background-color: #0d0d0d; color: #e0e0e0; flex: 1; overflow-y: auto; }
.text-glow { color: #fff; font-weight: 600; }
.btn-glow { background-color: #9d4edd; color: #fff; border-radius: 8px; }
</style>
