<template>
  <div class="home">
    <section class="hero">
      <div class="hero-backdrop"></div>
      <div class="shape shape-a"></div>
      <div class="shape shape-b"></div>
      <div class="container hero-content">
        <div class="hero-copy reveal up">
          <p class="eyebrow">Focused digital workspace</p>
          <h1 class="brand-title">Plan beautifully. Execute clearly.</h1>
          <p class="intro-text">
            Junie brings your Dashboard and Notebooks together so your priorities stay clear,
            your notes stay structured, and your daily progress stays visible.
          </p>
          <div class="hero-actions">
            <router-link to="/login" class="btn btn-primary">Login</router-link>
            <router-link to="/signup" class="btn btn-ghost">Sign Up</router-link>
          </div>
        </div>

        <div class="hero-panel reveal up delay-1">
          <h3>Inside Junie</h3>
          <div class="panel-row">
            <span class="dot"></span>
            <div>
              <h4>Dashboard</h4>
              <p>Track goals, routines, and tasks in one clean view.</p>
            </div>
          </div>
          <div class="panel-row">
            <span class="dot"></span>
            <div>
              <h4>Notebooks</h4>
              <p>Capture class notes, project plans, and study pages with structure.</p>
            </div>
          </div>
          <div class="panel-row">
            <span class="dot"></span>
            <div>
              <h4>Marketplace</h4>
              <p>Discover curated templates and tools that support your workflow.</p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="value-strip">
      <div class="container">
        <div class="about-intro reveal up">
          <p class="about-kicker">About Junie</p>
          <h2>Style and structure meet productivity.</h2>
          <p>
            Junie is a productivity-first platform for students and focused professionals.
            It combines a customizable dashboard and structured notebooks to turn scattered work
            into clear daily momentum.
          </p>
        </div>

        <div class="value-grid">
        <article class="value-card reveal up delay-1">
          <h3>Our Mission</h3>
          <p>
            Make focused work simple and sustainable with tools that help you plan, track,
            and improve one consistent day at a time.
          </p>
        </article>
        <article class="value-card reveal up delay-2">
          <h3>Our Vision</h3>
          <p>
            Build the most trusted workspace for intentional progress, where planning and doing
            are seamlessly connected.
          </p>
        </article>
        </div>
      </div>
    </section>

    <section class="editorial-band reveal up">
      <div class="container editorial-grid">
        <div class="editorial-copy">
          <p class="editorial-kicker">A New Standard</p>
          <h2>Your workflow, reimagined.</h2>
          <p class="editorial-text">
            Junie blends dashboard clarity, structured note-taking, and consistent progress
            into one elegant flow built for students and focused professionals.
          </p>
          <div class="feature-ticker">
            <span>Dashboard Clarity</span>
            <span>Smart Notes</span>
            <span>Template Marketplace</span>
            <span>Progress Tracking</span>
          </div>
        </div>
        <div class="editorial-media">
          <img
            src="https://i.pinimg.com/1200x/88/69/eb/8869eb436c562407332327a6ea7ec71a.jpg"
            alt="Junie workflow visual"
          />
          <div class="editorial-overlay"></div>
        </div>
      </div>
    </section>

    <section class="reasons-wrap">
      <div class="container">
        <div class="reasons-card reveal up">
          <div class="reasons-image-bg"></div>
          <div class="reasons-content">
            <h3>Reasons to Love Junie</h3>
            <ul class="reasons-list">
              <li>One connected workspace for planning and note-taking</li>
              <li>Visual dashboard blocks that keep progress measurable</li>
              <li>Notebook layout built for study sessions and project documentation</li>
              <li>Clean aesthetic that matches focus, not noise</li>
              <li>Designed for consistency across your academic and productivity flow</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container cta-card reveal up">
        <h3>Ready to simplify your workflow?</h3>
        <p>Start with Junie and keep your Dashboard and Notebooks in sync from day one.</p>
        <router-link to="/signup" class="btn btn-primary">Get Started</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  background: var(--dash-bg, var(--n-bg, #f4f7ff));
  color: var(--dash-title, var(--n-text, #171d35));
  min-height: 100vh;
  overflow-x: hidden;
  font-family: "Plus Jakarta Sans", sans-serif;
}

.hero {
  position: relative;
  min-height: calc(100vh - 74px);
  display: flex;
  align-items: center;
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(110deg, rgba(19, 29, 61, 0.35), rgba(19, 29, 61, 0.1)),
    url("https://i.pinimg.com/1200x/21/61/8e/21618e399ac27c80aac237c8e2e5021d.jpg")
      center/cover no-repeat;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.6;
  pointer-events: none;
  animation: float 8s ease-in-out infinite;
}

.shape-a {
  width: 220px;
  height: 220px;
  background: rgba(172, 214, 156, 0.35);
  top: 10%;
  right: 10%;
}

.shape-b {
  width: 160px;
  height: 160px;
  background: rgba(117, 153, 101, 0.35);
  bottom: 15%;
  left: 8%;
  animation-delay: 1.2s;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 28px;
  align-items: center;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 12px;
  color: #f7fbff;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.brand-title {
  color: #fff;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.04;
  letter-spacing: -0.03em;
  margin: 0 0 14px;
}

.intro-text {
  color: rgba(248, 252, 255, 0.94);
  max-width: 640px;
  line-height: 1.65;
  margin: 0 0 24px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--dash-accent, #4a6cff), var(--dash-accent-2, #6f86ff));
  color: #fff;
  box-shadow: 0 12px 22px rgba(59, 86, 182, 0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.42);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hero-panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--dash-border, var(--n-border, #dbe3ff));
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 16px 38px rgba(24, 39, 89, 0.2);
  backdrop-filter: blur(8px);
}

.hero-panel h3 {
  margin: 0 0 14px;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  color: var(--dash-title, var(--n-text, #171d35));
}

.note-demo {
  margin-top: 12px;
  background: #ffffff;
  border: 1px solid var(--dash-border, #dbe3ff);
  border-radius: 12px;
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.note-demo-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--dash-accent, #6f8f63);
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 14%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--dash-accent, #6f8f63) 35%, #ffffff);
  border-radius: 999px;
  padding: 3px 8px;
}

.note-time {
  font-size: 0.72rem;
  color: var(--n-text-muted, #647096);
}

.note-demo h5 {
  margin: 0 0 8px;
  font-size: 0.92rem;
  color: var(--dash-title, #171d35);
}

.note-line {
  height: 6px;
  margin: 0 0 6px;
  border-radius: 999px;
  width: 84%;
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 18%, #ffffff);
  animation: pulseLine 2.4s ease-in-out infinite;
}

.note-line.long {
  width: 96%;
}

.note-line.short {
  width: 62%;
}

.todo-line {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.82rem;
  color: var(--n-text-muted, #647096);
  margin-top: 6px;
}

.tick {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--dash-accent, #6f8f63) 55%, #ffffff);
  background: #fff;
}

.hero-thumbs {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.hero-thumbs img {
  width: 100%;
  height: 74px;
  object-fit: cover;
  border-radius: 10px;
}

.panel-row {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.panel-row h4 {
  margin: 0;
  font-size: 0.98rem;
}

.panel-row p {
  margin: 3px 0 0;
  color: var(--n-text-muted, #647096);
  font-size: 0.92rem;
}

.dot {
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--dash-accent, #4a6cff), var(--dash-accent-2, #18c6b8));
}

.trust-strip {
  background: color-mix(in srgb, var(--dash-card, #fff) 85%, #eef5e7);
  border-top: 1px solid var(--dash-border, #dbe3ff);
  border-bottom: 1px solid var(--dash-border, #dbe3ff);
}

.trust-items {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 14px 0;
  text-align: center;
  font-weight: 700;
  color: var(--dash-title, #171d35);
}

.steps-wrap {
  padding: 32px 0 10px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.step-card {
  background: var(--dash-card, rgba(255, 255, 255, 0.9));
  border: 1px solid var(--dash-border, #dbe3ff);
  border-radius: 16px;
  padding: 20px;
}

.step-no {
  margin: 0 0 6px;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  color: var(--dash-accent, #6f8f63);
  font-weight: 700;
}

.step-card h4 {
  margin: 0 0 8px;
}

.step-card p {
  margin: 0;
  color: var(--n-text-muted, #647096);
}

.value-strip {
  padding: 72px 0 42px;
}

.about-intro {
  margin-bottom: 44px;
  text-align: center;
}

.about-kicker {
  margin: 0 0 8px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dash-accent, #4a6cff);
}

.about-intro h2 {
  margin: 0 0 12px;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  font-size: clamp(1.7rem, 3.2vw, 2.8rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--dash-title, var(--n-text, #171d35));
  font-weight: 800;
}

.about-intro p {
  margin: 0;
  max-width: 820px;
  margin-inline: auto;
  line-height: 1.72;
  color: var(--n-text-muted, #647096);
}

.value-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;
  align-items: stretch;
}

.value-card,
.showcase-card,
.reasons-card {
  background: var(--dash-card, var(--n-surface, rgba(255, 255, 255, 0.9)));
  border: 1px solid var(--dash-border, var(--n-border, #dbe3ff));
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(36, 56, 122, 0.08);
}

.value-card {
  padding: 20px;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.95)),
    url("https://i.pinimg.com/736x/5e/c5/a6/5ec5a67c49658c248ce2a6fd6c901f1b.jpg");
  background-size: cover;
  background-position: center;
  text-align: center;
}

.value-card h3,
.showcase-card h3,
.reasons-card h3 {
  margin: 0 0 10px;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  color: var(--dash-title, var(--n-text, #171d35));
}

.value-card p,
.showcase-card p {
  margin: 0;
  color: var(--n-text-muted, #647096);
  line-height: 1.65;
}

.feature-showcase {
  padding: 18px 0 24px;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.showcase-card {
  padding: 22px;
  position: relative;
  overflow: hidden;
}

.showcase-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.9)),
    url("https://i.pinimg.com/1200x/39/97/a5/3997a580c3af8c2d3fcf9efff5085b1d.jpg") center/cover no-repeat;
  z-index: 0;
}

.showcase-card h3,
.showcase-card p {
  position: relative;
  z-index: 1;
}

.card-tag {
  margin: 0 0 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dash-accent, #4a6cff);
}

.reasons-wrap {
  padding: 26px 0 72px;
}

.editorial-band {
  padding: 22px 0 42px;
}

.editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: stretch;
}

.editorial-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.editorial-kicker {
  margin: 0 0 8px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dash-accent, #4a6cff);
  font-weight: 700;
}

.editorial-copy h2 {
  margin: 0 0 10px;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
  font-size: clamp(1.7rem, 3.4vw, 2.9rem);
  line-height: 1.1;
}

.editorial-text {
  margin: 0 0 14px;
  color: var(--n-text-muted, #647096);
  line-height: 1.72;
}

.feature-ticker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-ticker span {
  border: 1px solid var(--dash-border, #dbe3ff);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--dash-title, #171d35);
  background: color-mix(in srgb, var(--dash-card, #fff) 86%, #eef5e7);
}

.editorial-media {
  position: relative;
  min-height: 360px;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(29, 53, 95, 0.18);
}

.editorial-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.45s ease;
}

.editorial-media:hover img {
  transform: scale(1.03);
}

.editorial-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgba(20, 35, 67, 0.22), rgba(20, 35, 67, 0.04));
}

.reasons-card {
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

.reasons-image-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(105deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.84) 52%, rgba(255, 255, 255, 0.3) 100%),
    url("https://i.pinimg.com/1200x/b1/4b/0d/b14b0d67df508f46c4e4e9f85891fb08.jpg") center/cover no-repeat;
}

.reasons-content {
  position: relative;
  z-index: 1;
  max-width: 640px;
}

.reasons-list {
  margin: 0;
  padding-left: 18px;
  color: var(--n-text-muted, #647096);
  line-height: 1.7;
}

.visual-story {
  padding: 4px 0 24px;
}

.visual-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr;
  gap: 14px;
}

.visual-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  min-height: 220px;
  box-shadow: 0 12px 28px rgba(29, 53, 95, 0.16);
}

.visual-large {
  min-height: 300px;
}

.visual-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visual-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(21, 33, 62, 0.7), transparent);
  color: #fff;
}

.visual-overlay h3 {
  margin: 0;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
}

.metrics-wrap {
  padding: 0 0 28px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric {
  text-align: center;
  padding: 18px;
  border-radius: 14px;
  background: var(--dash-card, rgba(255, 255, 255, 0.9));
  border: 1px solid var(--dash-border, #dbe3ff);
}

.metric h3 {
  margin: 0;
  font-size: 2rem;
  color: var(--dash-accent, #6f8f63);
}

.metric p {
  margin: 6px 0 0;
  color: var(--n-text-muted, #647096);
}

.testimonials-wrap {
  padding: 0 0 28px;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.quote-card {
  background: var(--dash-card, rgba(255, 255, 255, 0.9));
  border: 1px solid var(--dash-border, #dbe3ff);
  border-radius: 16px;
  padding: 20px;
}

.quote-card p {
  margin: 0 0 8px;
  line-height: 1.65;
}

.quote-card span {
  color: var(--n-text-muted, #647096);
  font-size: 0.9rem;
}

.final-cta {
  padding: 16px 0 88px;
}

.cta-card {
  text-align: center;
  border-radius: 20px;
  padding: 28px;
  background: linear-gradient(135deg, rgba(111, 143, 99, 0.12), rgba(156, 175, 136, 0.18));
  border: 1px solid color-mix(in srgb, var(--dash-accent, #6f8f63) 22%, #dbe3ff);
}

.cta-card h3 {
  margin: 0 0 8px;
}

.cta-card p {
  margin: 0 0 16px;
  color: var(--n-text-muted, #647096);
}

.reveal {
  opacity: 0;
  animation: fadeUp 0.75s ease forwards;
}

.delay-1 {
  animation-delay: 0.15s;
}

.delay-2 {
  animation-delay: 0.28s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-14px);
  }
}

@keyframes pulseLine {
  0%,
  100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 992px) {
  .hero-content,
  .hero-thumbs,
  .editorial-grid,
  .value-grid,
  .showcase-grid,
  .visual-grid,
  .steps-grid,
  .metrics-grid,
  .testimonials-grid,
  .trust-items {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
    padding: 68px 0 42px;
  }

  .hero-panel {
    max-width: 620px;
  }

  .editorial-media {
    min-height: 280px;
    aspect-ratio: 16 / 10;
  }
}
</style>
