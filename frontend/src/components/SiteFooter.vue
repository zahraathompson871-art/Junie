<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">Junie</div>
      <div class="footer-copy">&copy; {{ year }} Junie. All rights reserved.</div>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    year() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.site-footer {
  margin-top: 36px;
  border-top: 1px solid #dbe3ff;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}

.footer-inner {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 14px;
  padding-bottom: 14px;
}

.footer-brand {
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
  color: #1f2b54;
}

.footer-copy {
  color: #7481ab;
  font-size: 0.9rem;
}
</style>
