<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">Dashboard Templates</h2>
      <p class="text-muted mb-4">Buy templates once and apply them to your dashboard.</p>

      <p v-if="error" class="text-danger">{{ error }}</p>
      <p v-if="success" class="text-success">{{ success }}</p>

      <div class="row g-4">
        <div class="col-md-4" v-for="template in templates" :key="template.id">
          <div class="product-card">
            <div class="product-image">
              <img :src="template.image" :alt="template.title" class="img-fluid rounded" />
            </div>
            <div class="product-details mt-2">
              <h6 class="product-title">{{ template.title }}</h6>
              <p class="product-description text-muted">{{ template.description }}</p>
              <div class="meta-row">
                <span class="product-price">R{{ template.price ?? 59 }}</span>
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
                v-if="isTemplateUnlocked(template)"
                class="btn btn-glow mt-2 w-100"
                :disabled="applyingId === template.id"
                @click="applyTemplate(template.id)"
              >
                {{ applyingId === template.id ? 'Applying...' : 'Apply to Dashboard' }}
              </button>
              <button
                v-else
                class="btn btn-glow mt-2 w-100"
                @click="addToCart(template)"
              >
                Add to Cart
              </button>
              <p v-if="isTemplateUnlocked(template)" class="unlock-tag">
                {{ hasActiveSubscription ? 'Unlocked by subscription' : 'Purchased template' }}
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
import { useCartStore } from '../stores/cart'

export default {
  data() {
    return {
      templates: [],
      applyingId: null,
      error: '',
      success: '',
      previewOpen: false,
      previewTemplate: null,
      hasActiveSubscription: false,
      purchasedTemplateIds: []
    }
  },
  setup() {
    const cart = useCartStore()
    return { cart }
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
      this.purchasedTemplateIds = Array.isArray(data.purchasedTemplateIds) ? data.purchasedTemplateIds : []
    },
    isTemplateUnlocked(template) {
      if (!template) return false
      return this.hasActiveSubscription || this.purchasedTemplateIds.includes(Number(template.id))
    },
    addToCart(template) {
      if (!this.cart.items.some(item => Number(item.id) === Number(template.id))) {
        this.cart.addItem({
          id: Number(template.id),
          title: template.title,
          price: Number(template.price || 59),
          image: template.image
        })
      }
      this.$router.push('/cart')
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
    }
  }
}
</script>

<style scoped>
.main {
  flex: 1;
  overflow-y: auto;
  background-color: #f7f6f3;
  color: #37352f;
}

.product-card {
  background: #fff;
  border: 1px solid #e6e3dd;
  border-radius: 10px;
  padding: 12px;
}

.product-image {
  overflow: hidden;
  border-radius: 8px;
}

.product-image img {
  width: 100%;
  height: 190px;
  object-fit: cover;
}

.product-title {
  font-weight: 600;
  color: #37352f;
}

.product-description {
  font-size: 0.92rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-weight: 700;
}

.widget-count {
  font-size: 12px;
  color: #8a867e;
}

.unlock-tag {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 12px;
  color: #53627d;
  font-weight: 600;
}

.theme-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-name {
  color: #526187;
  font-size: 12px;
  font-weight: 700;
  margin-right: 2px;
}

.theme-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(35, 53, 93, 0.22);
}

.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(25, 35, 52, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.preview-modal {
  width: min(520px, 100%);
  background: #f7fbff;
  border: 1px solid #d9e7f6;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 18px 45px rgba(40, 88, 132, 0.18);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.close-btn {
  border: 1px solid #c8d7ea;
  background: #fff;
  color: #4d6480;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  line-height: 1;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.preview-widget {
  border: 1px solid #d2e6f8;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px;
}

.widget-thumb {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f8fbff 0%, #e8f3fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0edf9;
  margin-bottom: 8px;
  overflow: hidden;
}

.widget-pill {
  background: color-mix(in srgb, var(--widget-accent) 16%, #ffffff);
  color: var(--widget-accent);
  border: 1px solid color-mix(in srgb, var(--widget-accent) 35%, #ffffff);
  border-radius: 999px;
  padding: 3px 10px;
  font-weight: 700;
  font-size: 12px;
}

.widget-name {
  color: #31506a;
  font-size: 12px;
  font-weight: 600;
}

.mini-list,
.mini-notes,
.mini-goal {
  width: 78%;
}

.mini-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.mini-item:last-child {
  margin-bottom: 0;
}

.mini-check {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  border: 1px solid var(--widget-accent);
  background: #fff;
}

.mini-line {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--widget-accent) 42%, #ffffff);
}

.mini-notes {
  display: grid;
  gap: 4px;
}

.note-line {
  display: block;
  height: 4px;
  width: 75%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--widget-accent) 35%, #ffffff);
}

.note-line.long {
  width: 92%;
}

.note-line.short {
  width: 55%;
}

.mini-calendar {
  width: 78%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.mini-cell {
  height: 8px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--widget-accent) 26%, #ffffff);
}

.mini-goal {
  display: grid;
  gap: 6px;
}

.goal-label {
  display: block;
  height: 4px;
  width: 60%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--widget-accent) 32%, #ffffff);
}

.goal-track {
  display: block;
  height: 8px;
  width: 100%;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #d9e8f7;
}

.goal-fill {
  display: block;
  height: 100%;
  width: 62%;
  border-radius: 999px;
  background: var(--widget-accent);
}

.mini-timer {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--widget-accent) 55%, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-core {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--widget-accent) 35%, #ffffff);
}

.mini-mood {
  display: flex;
  gap: 6px;
}

.mood-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--widget-accent) 40%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--widget-accent) 62%, #ffffff);
}

.mini-photo {
  width: 74%;
  height: 34px;
  border-radius: 6px;
  background: linear-gradient(180deg, #f9fdff 0%, #d7e9fa 100%);
  border: 1px solid #d4e6f7;
  position: relative;
  overflow: hidden;
}

.mount-a,
.mount-b {
  position: absolute;
  bottom: -4px;
  width: 22px;
  height: 18px;
  background: color-mix(in srgb, var(--widget-accent) 45%, #ffffff);
  transform: rotate(45deg);
}

.mount-a {
  left: 8px;
}

.mount-b {
  left: 24px;
  width: 16px;
  height: 16px;
  background: color-mix(in srgb, var(--widget-accent) 60%, #ffffff);
}
</style>

