<template>
  <div class="main" :class="`theme-${currentThemeKey}`" :style="themeStyle">
    <div class="container mt-4">

      <div class="header-section mb-4">
        <div class="header-image-wrapper">
          <img
            v-if="headerImage"
            :src="headerImage"
            alt="Header Image"
            class="header-image"
          />
          <div v-else class="header-placeholder">
            No image uploaded
          </div>

          <button 
            v-if="headerImage" 
            @click="removeHeaderImage" 
            class="remove-image-btn-overlay"
          >
            ×
          </button>
        </div>

        <button class="choose-image-btn" @click="$refs.fileInput.click()">
          Choose Image
        </button>

        <input 
          type="file" 
          accept="image/*" 
          @change="onImageUpload" 
          ref="fileInput" 
          style="display: none;" 
        />

        <h2 class="dashboard-title">My Dashboard</h2>
      </div>

      <div class="toolbar mb-4">
        <div class="add-widget">
          <button @click="toggleMenu" class="add-btn">+ Add Block</button>
          <div v-if="showMenu" class="add-menu" @click.stop>
            <div class="menu-label">Academic Core <span class="premium-badge">Premium</span></div>
            <div @click="addWidget('assignment_tracker')" :class="{ 'locked-item': !isPremium }">Assignment Tracker {{ !isPremium ? '🔒' : '' }}</div>
            <div @click="addWidget('study_session_log')" :class="{ 'locked-item': !isPremium }">Study Session Log {{ !isPremium ? '🔒' : '' }}</div>
            <div @click="addWidget('pomodoro')" :class="{ 'locked-item': !isPremium }">Pomodoro Timer {{ !isPremium ? '🔒' : '' }}</div>
            <div class="menu-label">Productivity Core</div>
            <div @click="addWidget('todo')">To-Do List</div>
            <div @click="addWidget('goal')">Goal Tracker</div>
            <div @click="addWidget('calendar')">Calendar</div>
            <div class="menu-label">Cozy Layer <span class="premium-badge">Premium</span></div>
            <div @click="addWidget('mood_tracker')" :class="{ 'locked-item': !isPremium }">Mood Tracker {{ !isPremium ? '🔒' : '' }}</div>
            <div @click="addWidget('quick_notes')" :class="{ 'locked-item': !isPremium }">Quick Notes {{ !isPremium ? '🔒' : '' }}</div>
            <div @click="addWidget('picture')" :class="{ 'locked-item': !isPremium }">Photos {{ !isPremium ? '🔒' : '' }}</div>
            <div v-if="!isPremium" class="upgrade-menu-hint" @click="upgradeToPremium">Upgrade to Premium</div>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-danger">{{ error }}</p>

      <draggable
        v-model="widgets"
        item-key="id"
        class="widgets-grid"
        ghost-class="ghost"
       
        @end="saveDashboardDebounced"
      >
        <template #item="{ element, index }">
          <div
            class="widget-item"
            :style="{ gridColumn: `span ${widgetSpan(element)}`, gridRow: `span ${widgetRows(element)}` }"
          >
            <div class="widget-shell">
              <button class="remove-btn" @click="removeWidget(index)">x</button>
              <component
                :is="resolveWidget(element.type)"
                :data="element.data"
                @update:data="updateWidgetData(index, $event)"
              />
              <div class="resize-handle-left" @mousedown="startResizeX(index, $event)" />
              <div class="resize-handle-bottom" @mousedown="startResizeY(index, $event)" />
            </div>
          </div>
        </template>
      </draggable>

    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { useCartStore } from '../stores/cart'
import ToDoWidget from '../components/widgets/toDoWidget.vue'
import GoalWidget from '../components/widgets/goalWidget.vue'
import PomodoroWidget from '../components/widgets/pomodoroWidget.vue'
import CalendarWidget from '../components/widgets/calendarWidget.vue'
import PictureWidget from '../components/widgets/pictureWidget.vue'
import AssignmentTrackerWidget from '../components/widgets/assignmentTrackerWidget.vue'
import StudySessionLogWidget from '../components/widgets/studySessionLogWidget.vue'
import MoodTrackerWidget from '../components/widgets/moodTrackerWidget.vue'
import QuickNotesWidget from '../components/widgets/quickNotesWidget.vue'

export default {
  components: {
    draggable,
    ToDoWidget,
    GoalWidget,
    PomodoroWidget,
    CalendarWidget,
    PictureWidget,
    AssignmentTrackerWidget,
    StudySessionLogWidget,
    MoodTrackerWidget,
    QuickNotesWidget
  },
  data() {
    return {
      widgets: [],
      saveTimer: null,
      loaded: false,
      error: '',
      showMenu: false,
      currentThemeKey: 'matcha',
      customTheme: null,
      headerImage: null,
      isPremium: false
    }
  },
  computed: {
    themeStyle() {
      const themes = {
        matcha: {
          '--dash-bg': '#f5faf1',
          '--dash-card': 'rgba(255,255,255,0.92)',
          '--dash-border': '#d5e5cf',
          '--dash-title': '#253629',
          '--dash-accent': '#6f8f63',
          '--dash-accent-2': '#9caf88'
        },
        coffee: {
          '--dash-bg': '#f5efe6',
          '--dash-card': 'rgba(255,255,255,0.92)',
          '--dash-border': '#e3d7c8',
          '--dash-title': '#3b2f29',
          '--dash-accent': '#7a5c4d',
          '--dash-accent-2': '#c89fa3'
        },
        flower: {
          '--dash-bg': '#fff6f9',
          '--dash-card': 'rgba(255,255,255,0.94)',
          '--dash-border': '#f1d7e4',
          '--dash-title': '#4a2f49',
          '--dash-accent': '#c38eb4',
          '--dash-accent-2': '#f4c2c2'
        },
        ocean: {
          '--dash-bg': '#f2f8fb',
          '--dash-card': 'rgba(255,255,255,0.94)',
          '--dash-border': '#cfe0ea',
          '--dash-title': '#2f3e46',
          '--dash-accent': '#6ba8a9',
          '--dash-accent-2': '#a7c7e7'
        },
        dark_academia: {
          '--dash-bg': '#1e1e22',
          '--dash-card': 'rgba(34,34,40,0.9)',
          '--dash-border': '#3a3f52',
          '--dash-title': '#eaeaea',
          '--dash-accent': '#4c5c8a',
          '--dash-accent-2': '#a29bfe'
        }
      }
      if (this.customTheme?.colors?.length >= 3) {
        const [bg, accent, accent2] = this.customTheme.colors
        return {
          '--dash-bg': bg,
          '--dash-card': this.currentThemeKey === 'dark_academia' ? 'rgba(34,34,40,0.9)' : 'rgba(255,255,255,0.92)',
          '--dash-border': themes[this.currentThemeKey]?.['--dash-border'] || '#d5e5cf',
          '--dash-title': themes[this.currentThemeKey]?.['--dash-title'] || '#253629',
          '--dash-accent': accent,
          '--dash-accent-2': accent2
        }
      }
      return themes[this.currentThemeKey] || themes.matcha
    }
  },
  async mounted() {
    this.loadThemeFromStorage()
    await this.loadSubscriptionStatus()
    await this.loadDashboard()
  },
  methods: {
    getCurrentUserId() {
      const token = this.getToken()
      if (!token) return 'guest'
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''))
        return String(payload.id || payload.userId || payload.sub || 'guest')
      } catch {
        return 'guest'
      }
    },
    getHeaderImageStorageKey() {
      return `dashboardHeaderImage:${this.getCurrentUserId()}`
    },
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    getToken() {
      return localStorage.getItem('token') || ''
    },
    authHeaders() {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`
      }
    },
    async parseJson(res) {
      try {
        return await res.json()
      } catch {
        return {}
      }
    },
    defaultWidgetData(type) {
      const defaults = {
        todo: [],
        goal: { current: 0, total: 10, target: 'New Goal' },
        pomodoro: {},
        calendar: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() },
        picture: { src: '' },
        assignment_tracker: [],
        study_session_log: [],
        mood_tracker: [],
        quick_notes: []
      }
      return defaults[type] ?? {}
    },
    defaultWidgetSize(type) {
      return ['assignment_tracker', 'study_session_log', 'quick_notes', 'picture'].includes(type) ? 6 : 4
    },
    defaultWidgetRows(type) {
      return ['assignment_tracker', 'study_session_log', 'quick_notes', 'picture'].includes(type) ? 2 : 1
    },
    normalizeWidgets(items = []) {
      return items.map((item, i) => {
        const type = item?.type || 'quick_notes'
        const size = Number(item?.size)
        const rows = Number(item?.rows)
        return {
          id: Number(item?.id) || Date.now() + i,
          type,
          data: item?.data ?? this.defaultWidgetData(type),
          size: Number.isFinite(size) ? size : this.defaultWidgetSize(type),
          rows: Number.isFinite(rows) ? rows : this.defaultWidgetRows(type)
        }
      })
    },
    async loadDashboard() {
      const token = this.getToken()
      if (!token) return
      const res = await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await this.parseJson(res)
      if (!res.ok) {
        this.error = data.message || 'Failed to load dashboard'
        return
      }
      this.widgets = this.normalizeWidgets(Array.isArray(data) ? data : [])
      this.loaded = true
    },
    saveDashboardDebounced() {
      if (this.saveTimer) clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => this.saveDashboard(), 300)
    },
    async saveDashboard() {
      const token = this.getToken()
      if (!token) return
      const payload = this.widgets.map((w) => ({
        id: w.id,
        type: w.type,
        data: w.data,
        size: this.widgetSpan(w),
        rows: this.widgetRows(w)
      }))
      const res = await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
        method: 'PUT',
        headers: this.authHeaders(),
        body: JSON.stringify({ dashboard: payload })
      })
      if (!res.ok) {
        const data = await this.parseJson(res)
        this.error = data.message || 'Failed to save dashboard'
      }
    },
    loadThemeFromStorage() {
      this.currentThemeKey = localStorage.getItem('dashboardThemeKey') || 'matcha';
      const savedTheme = localStorage.getItem('dashboardTheme')
      if (savedTheme) {
        try {
          this.customTheme = JSON.parse(savedTheme)
        } catch {
          this.customTheme = null
        }
      } else {
        this.customTheme = null
      }
      const savedImage = localStorage.getItem(this.getHeaderImageStorageKey());
      if (savedImage) this.headerImage = savedImage;
      else this.headerImage = null
    },
    onImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        this.headerImage = e.target.result
        localStorage.setItem(this.getHeaderImageStorageKey(), this.headerImage)
      }
      reader.readAsDataURL(file)
    },
    removeHeaderImage() {
      this.headerImage = null
      localStorage.removeItem(this.getHeaderImageStorageKey())
    },
    toggleMenu() { this.showMenu = !this.showMenu },
    async loadSubscriptionStatus() {
      const token = this.getToken()
      if (!token) return
      try {
        const res = await fetch(`${this.getApiBaseUrl()}/api/templates/entitlements`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await this.parseJson(res)
        this.isPremium = !!data.hasActiveSubscription
      } catch {
        this.isPremium = false
      }
    },
    addWidget(type) {
      const freeWidgets = ['calendar', 'todo', 'goal']
      if (!this.isPremium && !freeWidgets.includes(type)) {
        this.error = 'Upgrade to Premium to unlock all widgets.'
        this.showMenu = false
        return
      }
      this.widgets.push({
        id: Date.now(),
        type,
        data: this.defaultWidgetData(type),
        size: this.defaultWidgetSize(type),
        rows: this.defaultWidgetRows(type)
      })
      this.showMenu = false
      this.saveDashboardDebounced()
    },
    removeWidget(index) {
      this.widgets.splice(index, 1)
      this.saveDashboardDebounced()
    },
    updateWidgetData(index, nextData) {
      if (!this.widgets[index]) return
      this.widgets[index] = {
        ...this.widgets[index],
        data: nextData
      }
      this.saveDashboardDebounced()
    },
    upgradeToPremium() {
      const cart = useCartStore()
      cart.addItem({
        id: 'premium-monthly',
        cartKey: 'premium_subscription:premium-monthly',
        type: 'premium_subscription',
        title: 'Premium Plan (Monthly)',
        price: 149,
        image: ''
      })
      this.$router.push('/checkout')
    },
    resolveWidget(type) {
      const map = {
        todo: ToDoWidget,
        goal: GoalWidget,
        pomodoro: PomodoroWidget,
        calendar: CalendarWidget,
        picture: PictureWidget,
        assignment_tracker: AssignmentTrackerWidget,
        study_session_log: StudySessionLogWidget,
        mood_tracker: MoodTrackerWidget,
        quick_notes: QuickNotesWidget
      }
      return map[type] || null
    },
    widgetSpan(widget) { const span = Number(widget?.size); return Number.isFinite(span) ? Math.min(8, Math.max(1, span)) : 3 },
    widgetRows(widget) { const rows = Number(widget?.rows); return Number.isFinite(rows) ? Math.min(4, Math.max(1, rows)) : 1 },
    startResizeX(index, event) {
      if (!this.widgets[index]) return
      const startX = event.clientX
      const startSize = this.widgetSpan(this.widgets[index])
      const onMove = (moveEvent) => {
        const diff = Math.round((moveEvent.clientX - startX) / 70)
        this.widgets[index].size = Math.min(8, Math.max(1, startSize + diff))
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        this.saveDashboardDebounced()
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    startResizeY(index, event) {
      if (!this.widgets[index]) return
      const startY = event.clientY
      const startRows = this.widgetRows(this.widgets[index])
      const onMove = (moveEvent) => {
        const diff = Math.round((moveEvent.clientY - startY) / 90)
        this.widgets[index].rows = Math.min(4, Math.max(1, startRows + diff))
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        this.saveDashboardDebounced()
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
  }
}
</script>

<style scoped>
.main {
  background:
    radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--dash-accent) 12%, transparent) 0%, transparent 45%),
    radial-gradient(circle at 85% 90%, color-mix(in srgb, var(--dash-accent-2) 10%, transparent) 0%, transparent 50%),
    var(--dash-bg, #f5faf1);
  min-height: 100vh;
  padding-bottom: 50px;
  transition: background 0.3s ease;
  overflow-x: hidden;
}

.header-section { text-align:center; margin-bottom:2.5rem; }
.header-image-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 0.8rem;
}
.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-placeholder {
  width: 100%;
  height: 100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(200,200,200,0.15);
  border-radius: 16px;
  font-weight:600;
  color:#555;
  font-size:14px;
}

.choose-image-btn {
  background: linear-gradient(135deg,var(--dash-accent),var(--dash-accent-2));
  border: none;
  font-weight: 700;
  border-radius: 12px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
  margin-bottom: 12px;
  box-shadow:0 4px 10px rgba(0,0,0,0.1);
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.choose-image-btn:hover {
  transform: scale(1.03);
  filter: brightness(1.05);
}
.header-section:hover .choose-image-btn {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.remove-image-btn-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 75, 75, 0.9);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 2px 6px rgba(0,0,0,0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
}
.remove-image-btn-overlay:hover {
  background: rgba(255,75,75,1);
  transform: scale(1.15);
}
.header-image-wrapper:hover .remove-image-btn-overlay {
  opacity: 1;
  pointer-events: auto;
}

.dashboard-title {
  font-weight:900;
  font-size:40px;
  letter-spacing:-0.04em;
  margin-top:8px;
  background:linear-gradient(135deg,var(--dash-title),var(--dash-accent));
  background-clip:text;
  -webkit-background-clip:text;
  color:transparent;
  -webkit-text-fill-color:transparent;
}

.widgets-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); grid-auto-rows:minmax(180px,auto); grid-auto-flow:dense; gap:18px; }
.widget-item { min-width:0; animation:fadeUp 0.35s ease forwards; }
.widget-shell { position:relative; background:transparent; border-radius:16px; height:100%; transition:all 0.2s cubic-bezier(.4,0,.2,1); }
.widget-shell:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.04); }
.remove-btn { position:absolute; top:14px; right:14px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:6px; border:1px solid #e8e5e0; background:#fff; color:#a0998f; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s ease; z-index:5; opacity:0; }
.widget-shell:hover .remove-btn { opacity:1; }
.remove-btn:hover { background:#fee2e2; border-color:#fca5a5; color:#dc2626; }
.add-btn { background:linear-gradient(135deg,var(--dash-accent),var(--dash-accent-2)); border:none; font-weight:800; border-radius:16px; padding:10px 18px; color:#fff; box-shadow:0 10px 22px rgba(0,0,0,0.15),0 6px 14px color-mix(in srgb,var(--dash-accent) 40%,transparent); transition:all 0.25s ease; cursor:pointer;}
.add-btn:hover { transform:translateY(-3px) scale(1.04); filter:brightness(1.05);}
.add-menu { margin-top:12px; background:rgba(255,255,255,0.96); border-radius:18px; padding:10px; border:1px solid var(--dash-border); box-shadow:0 18px 40px rgba(0,0,0,0.12); width:230px; backdrop-filter:blur(10px); z-index:10;}
.add-menu div { padding:9px 10px; border-radius:8px; cursor:pointer; transition:0.2s ease; }
.menu-label { font-size:12px; font-weight:800; color:var(--dash-accent); text-transform:uppercase; letter-spacing:0.6px; margin-top:6px; }
.locked-item { opacity: 0.55; cursor: pointer; }
.premium-badge { background: #f0c060; color: #7a5500; font-size: 9px; padding: 1px 6px; border-radius: 99px; margin-left: 6px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; vertical-align: middle; }
.upgrade-menu-hint { margin-top: 8px; padding: 6px 10px; background: linear-gradient(135deg, #f0c060, #e8a020); color: #5a3800; font-weight: 700; font-size: 12px; border-radius: 8px; text-align: center; cursor: pointer; }
.add-menu div:hover { background: color-mix(in srgb,var(--dash-accent) 12%,#fff); }
.resize-handle-left, .resize-handle-bottom { opacity:0; transition:opacity 0.2s ease;}
.widget-shell:hover .resize-handle-left, .widget-shell:hover .resize-handle-bottom { opacity:0.8;}
.resize-handle-left { position:absolute; left:-6px; top:50%; transform:translateY(-50%); width:10px; height:60px; border-left:2px solid var(--dash-accent); cursor:ew-resize;}
.resize-handle-bottom { position:absolute; left:50%; bottom:-6px; transform:translateX(-50%); width:60px; height:10px; border-bottom:2px solid var(--dash-accent); cursor:ns-resize;}
.ghost { opacity:0.4;}
@keyframes fadeUp { from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
</style>

