<template>
  <div class="main dashboard-page" :class="`theme-${currentThemeKey}`" :style="themeStyle">
    <div class="container mt-4">
      <section class="dashboard-header">
        <div>
          <h2 class="dashboard-title">My Dashboard</h2>
          <p class="dashboard-subtitle">
            Organize your workspace with interactive widgets that save automatically.
          </p>
        </div>
        <div class="widget-controls">
          <select v-model="newWidgetType" class="form-select">
            <option v-for="option in widgetOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <button class="btn btn-glow" @click="addWidget">Add Widget</button>
        </div>
      </section>

      <p v-if="error" class="text-danger mb-3">{{ error }}</p>
      <p v-if="status" class="text-muted mb-3">{{ status }}</p>

      <draggable
        v-model="widgets"
        item-key="id"
        class="widgets-grid"
        ghost-class="drag-ghost"
        @end="saveDashboardDebounced"
      >
        <template #item="{ element, index }">
          <article class="widget-item">
            <header class="widget-topbar">
              <strong>{{ widgetLabel(element.type) }}</strong>
              <button class="remove-btn" @click="removeWidget(index)">Remove</button>
            </header>
            <component
              :is="resolveWidget(element.type)"
              :data="element.data"
              @update:data="updateWidgetData(index, $event)"
            />
          </article>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable"
import ToDoWidget from "../components/widgets/toDoWidget.vue"
import GoalWidget from "../components/widgets/goalWidget.vue"
import PomodoroWidget from "../components/widgets/pomodoroWidget.vue"
import CalendarWidget from "../components/widgets/calendarWidget.vue"
import PictureWidget from "../components/widgets/pictureWidget.vue"
import AssignmentTrackerWidget from "../components/widgets/assignmentTrackerWidget.vue"
import StudySessionLogWidget from "../components/widgets/studySessionLogWidget.vue"
import MoodTrackerWidget from "../components/widgets/moodTrackerWidget.vue"
import QuickNotesWidget from "../components/widgets/quickNotesWidget.vue"

const defaultsByType = {
  todo: [],
  goal: { current: 0, total: 10, target: "New Goal" },
  pomodoro: { time: 1500, initialTime: 1500 },
  calendar: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() },
  picture: { src: "" },
  assignment_tracker: [],
  study_session_log: [],
  mood_tracker: [],
  quick_notes: []
}

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
      newWidgetType: "todo",
      error: "",
      status: "",
      saveTimer: null,
      currentThemeKey: localStorage.getItem("dashboardThemeKey") || "default",
      themeStyle: {}
    }
  },
  computed: {
    widgetOptions() {
      return [
        { value: "todo", label: "To-Do List" },
        { value: "goal", label: "Goal Tracker" },
        { value: "calendar", label: "Calendar" },
        { value: "pomodoro", label: "Pomodoro Timer" },
        { value: "quick_notes", label: "Quick Notes" },
        { value: "assignment_tracker", label: "Assignment Tracker" },
        { value: "study_session_log", label: "Study Session Log" },
        { value: "mood_tracker", label: "Mood Tracker" },
        { value: "picture", label: "Photos" }
      ]
    }
  },
  async mounted() {
    this.applySavedTheme()
    await this.loadDashboard()
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
    },
    getToken() {
      return localStorage.getItem("token") || ""
    },
    async parseJson(response) {
      try {
        return await response.json()
      } catch {
        return {}
      }
    },
    applySavedTheme() {
      const rawTheme = localStorage.getItem("dashboardTheme")
      if (!rawTheme) return
      try {
        const parsed = JSON.parse(rawTheme)
        if (parsed?.colors?.length >= 3) {
          this.themeStyle = {
            "--dash-bg": parsed.colors[0],
            "--dash-accent": parsed.colors[1],
            "--dash-accent-2": parsed.colors[2]
          }
        }
      } catch {
        this.themeStyle = {}
      }
    },
    widgetLabel(type = "") {
      return String(type)
        .split("_")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    },
    resolveWidget(type = "") {
      const map = {
        todo: "ToDoWidget",
        goal: "GoalWidget",
        pomodoro: "PomodoroWidget",
        calendar: "CalendarWidget",
        picture: "PictureWidget",
        assignment_tracker: "AssignmentTrackerWidget",
        study_session_log: "StudySessionLogWidget",
        mood_tracker: "MoodTrackerWidget",
        quick_notes: "QuickNotesWidget"
      }
      return map[type] || "QuickNotesWidget"
    },
    normalizeWidgets(items = []) {
      return items
        .map((item, index) => ({
          id: Number(item.id) || Date.now() + index,
          type: item.type || "quick_notes",
          data: item.data ?? defaultsByType[item.type] ?? {}
        }))
    },
    async loadDashboard() {
      try {
        this.error = ""
        this.status = "Loading dashboard..."
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        })
        const data = await this.parseJson(response)
        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard")
        }
        const normalized = this.normalizeWidgets(Array.isArray(data) ? data : [])
        this.widgets = normalized.length ? normalized : this.defaultWidgets()
        this.status = "Dashboard ready"
      } catch (err) {
        this.error = err.message || "Failed to load dashboard"
      }
    },
    defaultWidgets() {
      return [
        { id: Date.now(), type: "todo", data: [] },
        { id: Date.now() + 1, type: "quick_notes", data: [] },
        { id: Date.now() + 2, type: "calendar", data: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() } }
      ]
    },
    addWidget() {
      const type = this.newWidgetType
      const data = JSON.parse(JSON.stringify(defaultsByType[type] ?? {}))
      this.widgets.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        type,
        data
      })
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
    saveDashboardDebounced() {
      if (this.saveTimer) clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => {
        this.saveDashboard()
      }, 450)
    },
    async saveDashboard() {
      try {
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({ dashboard: this.widgets })
        })
        const data = await this.parseJson(response)
        if (!response.ok) {
          throw new Error(data.message || "Failed to save dashboard")
        }
        this.status = "Saved"
      } catch (err) {
        this.error = err.message || "Failed to save dashboard"
      }
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--dash-bg, #f5f8ff);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.dashboard-title {
  margin: 0;
  color: #121212;
  font-weight: 800;
}

.dashboard-subtitle {
  margin: 6px 0 0;
  color: #5e6887;
}

.widget-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.widget-controls .form-select {
  min-width: 220px;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.widget-item {
  border: 1px solid #dbe3ff;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  padding: 10px;
  min-height: 150px;
}

.widget-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #2a355d;
  font-size: 13px;
}

.remove-btn {
  border: 1px solid #d2dbf5;
  border-radius: 8px;
  background: #f8fbff;
  color: #3f4c75;
  padding: 4px 8px;
  font-size: 12px;
}

.drag-ghost {
  opacity: 0.55;
}

@media (max-width: 900px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
