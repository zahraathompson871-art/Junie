<template>
  <div class="main" :class="`theme-${currentThemeKey}`" :style="themeStyle">
    <div class="container mt-4">
      <div class="header-section mb-4">
        <img
          :src="themeHeaderImage"
          alt="Header Image"
          class="header-image"
        />
        <h2 class="dashboard-title">My Dashboard</h2>
      </div>

      <div class="toolbar mb-4">
        <div class="add-widget">
          <button @click="toggleMenu" class="add-btn">+ Add Block</button>
          <div v-if="showMenu" class="add-menu">
            <div class="menu-label">Academic Core</div>
            <div @click="addWidget('assignment_tracker')">Assignment Tracker</div>
            <div @click="addWidget('study_session_log')">Study Session Log</div>
            <div @click="addWidget('pomodoro')">Pomodoro Timer</div>
            <div class="menu-label">Productivity Core</div>
            <div @click="addWidget('todo')">To-Do List</div>
            <div @click="addWidget('goal')">Goal Tracker</div>
            <div @click="addWidget('calendar')">Calendar</div>
            <div class="menu-label">Cozy Layer</div>
            <div @click="addWidget('mood_tracker')">Mood Tracker</div>
            <div @click="addWidget('quick_notes')">Quick Notes</div>
            <div @click="addWidget('picture')">Photos</div>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-danger">{{ error }}</p>

      <draggable v-model="widgets" item-key="id" class="widgets-grid" ghost-class="ghost">
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
      authToken: '',
      saveTimer: null,
      loaded: false,
      error: '',
      showMenu: false,
      resizing: null,
      currentThemeKey: 'matcha',
      themeHeaderImage: 'https://i.pinimg.com/1200x/61/29/b9/6129b9783e7a0973c03ffa37d9bc5f17.jpg'
    }
  },
  computed: {
    themeStyle() {
      const themes = {
        ocean: {
          '--dash-bg': '#edf7fc',
          '--dash-card': 'rgba(255,255,255,0.92)',
          '--dash-border': '#cde4f3',
          '--dash-title': '#234154',
          '--dash-accent': '#6ba8a9',
          '--dash-accent-2': '#8fbfda'
        },
        flower: {
          '--dash-bg': '#fff4f8',
          '--dash-card': 'rgba(255,255,255,0.92)',
          '--dash-border': '#f0cddd',
          '--dash-title': '#6d3f61',
          '--dash-accent': '#c38eb4',
          '--dash-accent-2': '#f1b4c5'
        },
        dark_academia: {
          '--dash-bg': '#181920',
          '--dash-card': 'rgba(33,36,46,0.95)',
          '--dash-border': '#353a4c',
          '--dash-title': '#f2f4ff',
          '--dash-accent': '#8d98d9',
          '--dash-accent-2': '#a29bfe'
        },
        matcha: {
          '--dash-bg': '#f5faf1',
          '--dash-card': 'rgba(255,255,255,0.92)',
          '--dash-border': '#d5e5cf',
          '--dash-title': '#253629',
          '--dash-accent': '#6f8f63',
          '--dash-accent-2': '#9caf88'
        },
        coffee: {
          '--dash-bg': '#f7efe6',
          '--dash-card': 'rgba(255,255,255,0.9)',
          '--dash-border': '#e5d4c3',
          '--dash-title': '#4d362a',
          '--dash-accent': '#9a715e',
          '--dash-accent-2': '#c89f82'
        }
      }
      return themes[this.currentThemeKey] || themes.matcha
    }
  },
  async mounted() {
    this.loadThemeFromStorage()
    await this.loadDashboard()
  },
  beforeUnmount() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.stopResize()
  },
  watch: {
    widgets: {
      handler() {
        if (!this.loaded) return
        this.queueSave()
      },
      deep: true
    }
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    loadThemeFromStorage() {
      this.currentThemeKey = localStorage.getItem('dashboardThemeKey') || 'matcha'
      this.themeHeaderImage = localStorage.getItem('dashboardThemeImage') || this.themeHeaderImage
    },
    defaultWidgets() {
      return [
        { id: Date.now() + 1, type: 'assignment_tracker', data: [], size: 6, rows: 2 },
        { id: Date.now() + 2, type: 'study_session_log', data: [], size: 6, rows: 2 },
        { id: Date.now() + 3, type: 'pomodoro', data: {}, size: 4, rows: 1 },
        { id: Date.now() + 4, type: 'todo', data: [{ text: 'Finish AI assignment', done: false }], size: 4, rows: 1 },
        { id: Date.now() + 5, type: 'goal', data: { current: 3, total: 10, target: 'Complete 10 study sessions' }, size: 4, rows: 1 },
        { id: Date.now() + 6, type: 'calendar', data: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() }, size: 4, rows: 1 },
        { id: Date.now() + 7, type: 'mood_tracker', data: [], size: 4, rows: 1 },
        { id: Date.now() + 8, type: 'quick_notes', data: [], size: 6, rows: 2 },
        { id: Date.now() + 9, type: 'picture', data: { src: '' }, size: 6, rows: 2 }
      ]
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
    addWidget(type) {
      const defaults = {
        todo: [],
        goal: { current: 0, total: 10, target: 'New Goal' },
        pomodoro: {},
        calendar: {},
        picture: { src: '' },
        assignment_tracker: [],
        study_session_log: [],
        mood_tracker: [],
        quick_notes: []
      }
      const calendarDefault = { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() }
      this.widgets.push({
        id: Date.now(),
        type,
        data: type === 'calendar' ? calendarDefault : defaults[type],
        size: ['assignment_tracker', 'study_session_log', 'quick_notes', 'picture'].includes(type) ? 6 : 4,
        rows: ['assignment_tracker', 'study_session_log', 'quick_notes', 'picture'].includes(type) ? 2 : 1
      })
      this.showMenu = false
    },
    removeWidget(index) {
      this.widgets.splice(index, 1)
    },
    widgetSpan(widget) {
      const span = Number(widget?.size)
      if (Number.isFinite(span)) return Math.min(12, Math.max(3, span))
      return 4
    },
    widgetRows(widget) {
      const rows = Number(widget?.rows)
      return Number.isFinite(rows) ? Math.min(4, Math.max(1, rows)) : 1
    },
    startResizeX(index, event) {
      event.preventDefault()
      const currentSpan = this.widgetSpan(this.widgets[index])
      this.resizing = { axis: 'x', index, startX: event.clientX, startSpan: currentSpan }
      window.addEventListener('mousemove', this.onResizeMove)
      window.addEventListener('mouseup', this.stopResize)
    },
    startResizeY(index, event) {
      event.preventDefault()
      const currentRows = this.widgetRows(this.widgets[index])
      this.resizing = { axis: 'y', index, startY: event.clientY, startRows: currentRows }
      window.addEventListener('mousemove', this.onResizeMove)
      window.addEventListener('mouseup', this.stopResize)
    },
    onResizeMove(event) {
      if (!this.resizing) return
      if (!this.widgets[this.resizing.index]) return

      if (this.resizing.axis === 'x') {
        const dx = event.clientX - this.resizing.startX
        const deltaSpan = Math.round(dx / 48)
        const next = Math.min(12, Math.max(3, this.resizing.startSpan - deltaSpan))
        this.widgets[this.resizing.index].size = next
      } else {
        const dy = event.clientY - this.resizing.startY
        const deltaRows = Math.round(dy / 90)
        const nextRows = Math.min(4, Math.max(1, this.resizing.startRows + deltaRows))
        this.widgets[this.resizing.index].rows = nextRows
      }
    },
    stopResize() {
      if (!this.resizing) return
      this.resizing = null
      window.removeEventListener('mousemove', this.onResizeMove)
      window.removeEventListener('mouseup', this.stopResize)
    },
    updateWidgetData(index, data) {
      if (!this.widgets[index]) return
      this.widgets[index].data = data
    },
    async loadDashboard() {
      this.authToken = localStorage.getItem('token') || ''
      if (!this.authToken) {
        this.widgets = this.defaultWidgets()
        this.loaded = true
        return
      }

      try {
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        })
        if (!response.ok) throw new Error('Failed to load dashboard')
        const data = await response.json()
        this.widgets = Array.isArray(data) && data.length
          ? data.map(w => ({ ...w, size: this.widgetSpan(w), rows: this.widgetRows(w) }))
          : this.defaultWidgets()
        this.loaded = true
        if (!Array.isArray(data) || !data.length) await this.saveDashboard()
      } catch (err) {
        this.error = 'Failed to load dashboard data'
        this.widgets = this.defaultWidgets()
        this.loaded = true
      }
    },
    queueSave() {
      if (!this.authToken) return
      if (this.saveTimer) clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => {
        this.saveDashboard()
      }, 250)
    },
    async saveDashboard() {
      if (!this.authToken) return
      try {
        await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ dashboard: this.widgets })
        })
      } catch {
        this.error = 'Failed to save dashboard changes'
      }
    },
    toggleMenu() {
      this.showMenu = !this.showMenu
    }
  }
}
</script>

<style scoped>
.main {
  background: var(--dash-bg, #f5faf1);
  min-height: 100vh;
  transition: background 0.25s ease;
}

.header-section {
  text-align: center;
}

.header-image {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 20px;
  margin-bottom: 1rem;
  box-shadow: 0 14px 34px rgba(48, 66, 130, 0.2);
}

.dashboard-title {
  font-weight: 800;
  color: var(--dash-title, #1c2446);
  font-size: 30px;
  letter-spacing: -0.03em;
  margin-top: 12px;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
}

.widget-shell {
  position: relative;
  background: var(--dash-card, rgba(255, 255, 255, 0.9));
  border-radius: 16px;
  padding: 18px;
  height: 100%;
  transition: all 0.2s ease;
  border: 1px solid var(--dash-border, #d9e3ff);
  box-shadow: 0 10px 25px rgba(36, 56, 122, 0.08);
  backdrop-filter: blur(10px);
}

.widget-shell:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(36, 56, 122, 0.15);
}

.remove-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 14%, #ffffff);
  color: var(--dash-accent, #4c5f97);
  font-weight: bold;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--dash-accent, #6f8f63) 36%, #ffffff);
  width: 22px;
  height: 22px;
  font-size: 12px;
}

.remove-btn:hover {
  background: color-mix(in srgb, var(--dash-accent, #6f8f63) 22%, #ffffff);
}

.ghost {
  opacity: 0.5;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(140px, auto);
  gap: 14px;
}

.widget-item {
  min-width: 0;
  grid-column: span 4;
}

@media (max-width: 992px) {
  .widget-item {
    grid-column: span 6;
  }
}

@media (max-width: 640px) {
  .widget-item {
    grid-column: span 12;
  }
}

.add-btn {
  background: linear-gradient(135deg, var(--dash-accent, #4a6cff), var(--dash-accent-2, #6d86ff));
  border: none;
  font-weight: 700;
  border-radius: 12px;
  padding: 8px 14px;
  transition: 0.2s ease;
  color: #fff;
  box-shadow: 0 10px 20px rgba(74, 108, 255, 0.28);
}

.add-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.add-menu {
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 14px;
  padding: 8px;
  border: 1px solid var(--dash-border, #d9e3ff);
  box-shadow: 0 12px 26px rgba(36, 56, 122, 0.14);
  width: 220px;
}

.add-menu div {
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
}

.menu-label {
  font-size: 11px;
  font-weight: 700;
  color: color-mix(in srgb, var(--dash-accent, #4a6cff) 55%, #6a769d);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.add-menu div:hover {
  background: color-mix(in srgb, var(--dash-accent, #4a6cff) 12%, #ffffff);
}

.resize-handle-left {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 48px;
  border-left: 2px solid var(--dash-accent, #6c82d6);
  opacity: 0;
  cursor: ew-resize;
  transition: opacity 0.15s ease;
}

.resize-handle-bottom {
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  width: 48px;
  height: 10px;
  border-bottom: 2px solid var(--dash-accent, #6c82d6);
  opacity: 0;
  cursor: ns-resize;
  transition: opacity 0.15s ease;
}

.widget-shell:hover .resize-handle-left,
.widget-shell:hover .resize-handle-bottom {
  opacity: 0.8;
}

:deep(.widget-card),
:deep(.calendar-widget),
:deep(.picture-widget) {
  box-shadow: none !important;
  border: 1px solid var(--dash-border, #d9e3ff) !important;
  border-radius: 12px !important;
  background: var(--dash-card, rgba(255, 255, 255, 0.95)) !important;
}

:deep(.calendar-widget::before) {
  background: rgba(255, 255, 255, 0.92) !important;
}

:deep(.progress-bar),
:deep(.add-btn),
:deep(.start),
:deep(.pause),
:deep(.reset) {
  background: linear-gradient(135deg, var(--dash-accent, #4a6cff), var(--dash-accent-2, #6d86ff)) !important;
}

:deep(.percentage),
:deep(.counter),
:deep(.status.running) {
  color: var(--dash-title, #1f2c55) !important;
}
</style>
