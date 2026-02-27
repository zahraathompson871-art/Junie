<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">Dashboard Templates</h2>
      <p v-if="hasActiveSubscription" class="text-muted mb-4">Browse and apply any template — included with your Premium plan.</p>
      <div v-else class="free-banner mb-4">
        <p><strong>Upgrade to Premium</strong> to access all templates and apply them to your dashboard.</p>
        <button class="btn-upgrade" @click="upgradeToPremium">Get Premium</button>
      </div>

      <p v-if="error" class="text-danger">{{ error }}</p>
      <p v-if="success" class="text-success">{{ success }}</p>

      <div class="row g-4" data-tour="marketplace-grid">
        <div class="col-md-4" v-for="template in templates" :key="template.id">
          <div class="product-card">
            <div class="product-image">
              <img :src="template.image" :alt="template.title" class="img-fluid rounded" />
            </div>
            <div class="product-details mt-2">
              <h6 class="product-title">{{ template.title }}</h6>
              <p class="product-description text-muted">{{ template.description }}</p>
              <div class="meta-row">
                <span class="widget-count">{{ template.widgetCount ?? '-' }} widgets</span>
              </div>
              <div class="theme-meta" v-if="template.theme?.name">
                <span class="theme-name">{{ template.theme.name }}</span>
                <span
                  v-for="(color, i) in (template.theme?.colors || [])"
                  :key="`${template.id}-${i}`"
                  class="theme-dot"
                  :style="{ background: color }"
                />
              </div>
              <button
                class="btn btn-outline-secondary mt-2 w-100"
                @click="openPreview(template)"
              >
                Preview
              </button>
              <button
                v-if="hasActiveSubscription"
                class="btn btn-glow mt-2 w-100"
                :disabled="applyingId === template.id"
                @click="applyTemplate(template.id)"
              >
                {{ applyingId === template.id ? 'Applying...' : 'Apply Template' }}
              </button>
              <button
                v-else
                class="btn btn-upgrade mt-2 w-100"
                @click="upgradeToPremium"
              >
                Upgrade to Premium
              </button>
              <p v-if="hasActiveSubscription" class="unlock-tag">
                Included with your Premium plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="previewOpen" class="preview-backdrop" @click="closePreview">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h5 class="mb-1">{{ previewTemplate?.title }}</h5>
          <button class="close-btn" @click="closePreview">x</button>
        </div>
        <p class="text-muted mb-3">{{ previewTemplate?.description }}</p>
        <div class="preview-grid" v-if="previewWidgetCards.length">
          <div
            v-for="widget in previewWidgetCards"
            :key="widget.type"
            class="preview-widget"
            :style="{ '--widget-accent': widget.accent }"
          >
            <div class="widget-thumb">
              <template v-if="widget.type === 'calendar'">
                <div class="mini-calendar">
                  <span v-for="n in 12" :key="n" class="mini-cell" />
                </div>
              </template>
              <template v-else-if="widget.type === 'todo' || widget.type === 'assignment_tracker'">
                <div class="mini-list">
                  <div class="mini-item" v-for="n in 3" :key="n">
                    <span class="mini-check" />
                    <span class="mini-line" />
                  </div>
                </div>
              </template>
              <template v-else-if="widget.type === 'study_session_log' || widget.type === 'quick_notes'">
                <div class="mini-notes">
                  <span class="note-line long" />
                  <span class="note-line" />
                  <span class="note-line short" />
                </div>
              </template>
              <template v-else-if="widget.type === 'goal'">
                <div class="mini-goal">
                  <span class="goal-label" />
                  <span class="goal-track"><span class="goal-fill" /></span>
                </div>
              </template>
              <template v-else-if="widget.type === 'pomodoro'">
                <div class="mini-timer">
                  <span class="timer-core" />
                </div>
              </template>
              <template v-else-if="widget.type === 'mood_tracker'">
                <div class="mini-mood">
                  <span class="mood-dot" />
                  <span class="mood-dot" />
                  <span class="mood-dot" />
                </div>
              </template>
              <template v-else-if="widget.type === 'picture'">
                <div class="mini-photo">
                  <span class="mount-a" />
                  <span class="mount-b" />
                </div>
              </template>
              <template v-else>
                <span class="widget-pill">{{ widget.short }}</span>
              </template>
            </div>
            <div class="widget-name">{{ widget.label }}</div>
          </div>
        </div>
        <p v-else class="text-muted mb-0">No widgets listed for this template yet.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      templates: [],
      applyingId: null,
      error: '',
      success: '',
      previewOpen: false,
      previewTemplate: null,
      hasActiveSubscription: false
    }
  },
  computed: {
    previewWidgetCards() {
      const list = this.previewTemplate?.previewWidgets || []
      return list.map(type => {
        const meta = this.getWidgetMeta(type)
        return { type, ...meta }
      })
    }
  },
  async mounted() {
    await this.loadTemplates()
    await this.loadEntitlements()
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    getToken() {
      return localStorage.getItem('token') || ''
    },
    async parseJson(response) {
      try {
        return await response.json()
      } catch {
        return {}
      }
    },
    async loadTemplates() {
      this.error = ''
      const response = await fetch(`${this.getApiBaseUrl()}/api/templates`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      })
      const data = await this.parseJson(response)
      if (!response.ok) {
        this.error = data.message || data.error || 'Failed to load templates'
        return
      }
      this.templates = Array.isArray(data) ? data : []
    },
    async loadEntitlements() {
      const token = this.getToken()
      if (!token) return

      const response = await fetch(`${this.getApiBaseUrl()}/api/templates/entitlements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await this.parseJson(response)
      if (!response.ok) return

      this.hasActiveSubscription = !!data.hasActiveSubscription
    },
    openPreview(template) {
      this.previewTemplate = template
      this.previewOpen = true
    },
    closePreview() {
      this.previewOpen = false
      this.previewTemplate = null
    },
    formatWidgetLabel(name = '') {
      return String(name)
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    },
    getWidgetMeta(type = '') {
      const lookup = {
        assignment_tracker: { short: 'AT', accent: '#7aa087' },
        study_session_log: { short: 'SL', accent: '#6f93b7' },
        pomodoro: { short: 'PM', accent: '#d18a7a' },
        todo: { short: 'TD', accent: '#6f8cc6' },
        goal: { short: 'GL', accent: '#b4885f' },
        calendar: { short: 'CL', accent: '#7a86c2' },
        mood_tracker: { short: 'MD', accent: '#ba86ac' },
        quick_notes: { short: 'QN', accent: '#8f9aa7' },
        picture: { short: 'PH', accent: '#6ea0a6' }
      }
      const base = lookup[type] || { short: 'WG', accent: '#8ea0b3' }
      return {
        ...base,
        label: this.formatWidgetLabel(type)
      }
    },
    async applyTemplate(templateId) {
      try {
        this.error = ''
        this.success = ''
        this.applyingId = templateId
        const selectedTemplate = this.templates.find(t => t.id === templateId)
        const token = this.getToken()
        if (!token) {
          throw new Error('Please log in before applying a template')
        }
        const response = await fetch(`${this.getApiBaseUrl()}/api/templates/${templateId}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await this.parseJson(response)
        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to apply template')
        }
        if (data.themeKey) {
          localStorage.setItem('dashboardThemeKey', data.themeKey)
        }
        if (data.theme) {
          localStorage.setItem('dashboardTheme', JSON.stringify(data.theme))
        }
        if (selectedTemplate?.image) {
          localStorage.setItem('dashboardThemeImage', selectedTemplate.image)
        }
        this.success = 'Template applied. Redirecting to Dashboard...'
        setTimeout(() => {
          this.$router.push('/dashboard')
        }, 350)
      } catch (err) {
        this.error = err.message || 'Failed to apply template'
      } finally {
        this.applyingId = null
      }
    },
    upgradeToPremium() {
      this.$router.push('/checkout')
    }
  }
}
</script>

<style scoped>
.main {
  flex: 1;
  overflow-y: auto;
  background: #f7f6f3;
  color: #1a1917;
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
}

.text-glow {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1a1917;
  margin-bottom: 6px;
}

.text-muted {
  color: #a0998f;
  font-size: 0.93rem;
  margin-bottom: 0;
}

.free-banner {
  background: #fff;
  border: 1.5px solid #f0c060;
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.free-banner p {
  margin: 0;
  font-size: 0.92rem;
  color: #7a5000;
}

.text-danger { color: #dc2626; font-size: 13.5px; }
.text-success { color: #2d7a52; font-size: 13.5px; }

.product-card {
  background: #fff;
  border: 1.5px solid #eeecea;
  border-radius: 16px;
  padding: 12px;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  border-color: #d0cdc8;
}

.product-image {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #eeecea;
}

.product-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img { transform: scale(1.02); }

.product-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 6px;
}

.product-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1917;
  margin: 0;
  letter-spacing: -0.01em;
}

.product-description {
  font-size: 12.5px;
  color: #8a867e;
  line-height: 1.45;
  margin: 0;
}

.meta-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.widget-count {
  font-size: 11px;
  font-weight: 600;
  color: #b0aba3;
  background: #f5f4f1;
  padding: 3px 8px;
  border-radius: 99px;
}

.theme-meta {
  display: flex;
  align-items: center;
  gap: 5px;
}

.theme-name {
  font-size: 11px;
  font-weight: 700;
  color: #a0998f;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 3px;
}

.theme-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid rgba(0,0,0,0.1);
}

.btn {
  font-family: inherit;
  cursor: pointer;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  transition: all 0.15s;
  text-align: center;
  width: 100%;
  display: block;
}

.btn-outline-secondary {
  background: #faf9f7;
  border: 1.5px solid #eeecea;
  color: #6b6760;
}

.btn-outline-secondary:hover {
  background: #f0ede8;
  border-color: #d0cdc8;
  color: #3d3a35;
}

.btn-glow {
  background: #1a1917;
  color: #fff;
  border: none;
  margin-top: 4px;
}

.btn-glow:hover:not(:disabled) { background: #2d2b28; }
.btn-glow:disabled { background: #c0bbb5; cursor: not-allowed; }

.btn-upgrade {
  background: linear-gradient(135deg, #f0c060, #e8a020);
  color: #5a3800;
  border: none;
  font-weight: 700;
  margin-top: 4px;
}

.btn-upgrade:hover { background: linear-gradient(135deg, #e8b030, #d09010); }

.unlock-tag {
  margin: 4px 0 0;
  font-size: 11px;
  font-weight: 600;
  color: #3a9e6f;
  text-align: center;
}

.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26,25,23,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.preview-modal {
  width: min(520px, 100%);
  background: #fff;
  border: 1.5px solid #eeecea;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 24px 56px rgba(0,0,0,0.14);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.preview-header h5 {
  font-size: 15px;
  font-weight: 700;
  color: #1a1917;
  margin: 0;
  letter-spacing: -0.01em;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: 1.5px solid #eeecea;
  background: #faf9f7;
  color: #6b6760;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;
  font-family: inherit;
}

.close-btn:hover { background: #f0ede8; color: #3d3a35; }

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.preview-widget {
  border: 1.5px solid #eeecea;
  border-radius: 12px;
  background: #faf9f7;
  padding: 10px 8px;
  text-align: center;
}

.widget-thumb {
  height: 52px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eeecea;
  margin-bottom: 8px;
  overflow: hidden;
}

.widget-pill {
  background: color-mix(in srgb, var(--widget-accent) 14%, #fff);
  color: var(--widget-accent);
  border: 1.5px solid color-mix(in srgb, var(--widget-accent) 28%, #eeecea);
  border-radius: 99px;
  padding: 3px 10px;
  font-weight: 700;
  font-size: 11px;
}

.widget-name {
  font-size: 11px;
  font-weight: 600;
  color: #6b6760;
}

.mini-list, .mini-notes, .mini-goal { width: 80%; }

.mini-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.mini-item:last-child { margin-bottom: 0; }

.mini-check {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  border: 1.5px solid var(--widget-accent);
  background: #fff;
}

.mini-line {
  flex: 1;
  height: 3px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--widget-accent) 35%, #eeecea);
}

.mini-notes { display: grid; gap: 4px; }

.note-line {
  display: block;
  height: 3px;
  width: 75%;
  border-radius: 99px;
  background: color-mix(in srgb, var(--widget-accent) 30%, #eeecea);
}
.note-line.long { width: 92%; }
.note-line.short { width: 50%; }

.mini-calendar {
  width: 80%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}

.mini-cell {
  height: 7px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--widget-accent) 22%, #eeecea);
}

.mini-goal { display: grid; gap: 6px; }

.goal-label {
  display: block;
  height: 3px;
  width: 55%;
  border-radius: 99px;
  background: color-mix(in srgb, var(--widget-accent) 28%, #eeecea);
}

.goal-track {
  display: block;
  height: 7px;
  width: 100%;
  border-radius: 99px;
  background: #eeecea;
}

.goal-fill {
  display: block;
  height: 100%;
  width: 62%;
  border-radius: 99px;
  background: var(--widget-accent);
}

.mini-timer {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--widget-accent) 50%, #eeecea);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-core {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--widget-accent) 30%, #fff);
}

.mini-mood { display: flex; gap: 5px; }

.mood-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--widget-accent) 35%, #fff);
  border: 1.5px solid color-mix(in srgb, var(--widget-accent) 55%, #eeecea);
}

.mini-photo {
  width: 72%;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(180deg, #faf9f7 0%, #eeecea 100%);
  border: 1px solid #eeecea;
  position: relative;
  overflow: hidden;
}

.mount-a, .mount-b {
  position: absolute;
  bottom: -4px;
  width: 20px;
  height: 16px;
  background: color-mix(in srgb, var(--widget-accent) 40%, #fff);
  transform: rotate(45deg);
}
.mount-a { left: 8px; }
.mount-b { left: 22px; width: 14px; height: 14px; background: color-mix(in srgb, var(--widget-accent) 55%, #fff); }
</style>
