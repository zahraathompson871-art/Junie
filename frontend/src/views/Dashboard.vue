<template>
  <div class="main" :class="`theme-${currentThemeKey}`" :style="themeStyle">
    <div class="container mt-4">

      <!-- HEADER -->
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

          <!-- REMOVE IMAGE BUTTON -->
          <button 
            v-if="headerImage" 
            @click="removeHeaderImage" 
            class="remove-image-btn-overlay"
          >
            ×
          </button>
        </div>

        <!-- VISIBLE CHOOSE IMAGE BUTTON -->
        <button class="choose-image-btn" @click="$refs.fileInput.click()">
          Choose Image
        </button>

        <!-- Hidden file input -->
        <input 
          type="file" 
          accept="image/*" 
          @change="onImageUpload" 
          ref="fileInput" 
          style="display: none;" 
        />

        <h2 class="dashboard-title">My Dashboard</h2>
      </div>

      <!-- ADD WIDGET TOOLBAR -->
      <div class="toolbar mb-4">
        <div class="add-widget">
          <button @click="toggleMenu" class="add-btn">+ Add Block</button>
          <div v-if="showMenu" class="add-menu" @click.stop>
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

      <!-- ERROR MESSAGE -->
      <p v-if="error" class="text-danger">{{ error }}</p>

      <!-- WIDGET GRID -->
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
      headerImage: null
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
        }
      }
      return themes[this.currentThemeKey] || themes.matcha
    }
  },
  mounted() {
    this.loadThemeFromStorage()
  },
  methods: {
    loadThemeFromStorage() {
      this.currentThemeKey = localStorage.getItem('dashboardThemeKey') || 'matcha';
      const savedImage = localStorage.getItem('dashboardHeaderImage');
      if (savedImage) this.headerImage = savedImage;
    },
    onImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        this.headerImage = e.target.result
        localStorage.setItem('dashboardHeaderImage', this.headerImage)
      }
      reader.readAsDataURL(file)
    },
    removeHeaderImage() {
      this.headerImage = null
      localStorage.removeItem('dashboardHeaderImage')
    },
    toggleMenu() { this.showMenu = !this.showMenu },
    addWidget(type) { 
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
      this.widgets.push({
        id: Date.now(),
        type,
        data: defaults[type],
        size: ['assignment_tracker','study_session_log','quick_notes','picture'].includes(type) ? 6 : 4,
        rows: ['assignment_tracker','study_session_log','quick_notes','picture'].includes(type) ? 2 : 1
      })
      this.showMenu = false
    },
    removeWidget(index) { this.widgets.splice(index, 1) },
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
    widgetSpan(widget) { const span = Number(widget?.size); return Number.isFinite(span) ? Math.min(12, Math.max(3, span)) : 4 },
    widgetRows(widget) { const rows = Number(widget?.rows); return Number.isFinite(rows) ? Math.min(4, Math.max(1, rows)) : 1 },
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
  max-height: 300px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 0.8rem;
}
.header-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
}
.header-placeholder {
  width: 100%;
  height: 180px;
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
}
.choose-image-btn:hover {
  transform: scale(1.03);
  filter: brightness(1.05);
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
}
.remove-image-btn-overlay:hover {
  background: rgba(255,75,75,1);
  transform: scale(1.15);
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

.widgets-grid { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); grid-auto-rows:minmax(160px,auto); gap:22px; }
.widget-item { min-width:0; animation:fadeUp 0.4s ease forwards; }
.widget-shell { position:relative; background:var(--dash-card,rgba(255,255,255,0.95)); border-radius:24px; padding:22px; height:100%; transition:all 0.25s cubic-bezier(.4,0,.2,1); border:1px solid var(--dash-border,#e2e8f0); box-shadow:0 12px 30px rgba(0,0,0,0.06),0 6px 16px rgba(0,0,0,0.04); backdrop-filter:blur(14px);}
.widget-shell:hover { transform:translateY(-6px) scale(1.015); box-shadow:0 20px 45px rgba(0,0,0,0.12),0 8px 20px rgba(0,0,0,0.06);}
.remove-btn { position:absolute; top:14px; right:14px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:none; background: color-mix(in srgb, var(--dash-accent) 15%, white); color: var(--dash-accent); font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.08); transition: all 0.2s ease; z-index:5; }
.remove-btn:hover { background: var(--dash-accent); color:white; transform:scale(1.1);}
.add-btn { background:linear-gradient(135deg,var(--dash-accent),var(--dash-accent-2)); border:none; font-weight:800; border-radius:16px; padding:10px 18px; color:#fff; box-shadow:0 10px 22px rgba(0,0,0,0.15),0 6px 14px color-mix(in srgb,var(--dash-accent) 40%,transparent); transition:all 0.25s ease; cursor:pointer;}
.add-btn:hover { transform:translateY(-3px) scale(1.04); filter:brightness(1.05);}
.add-menu { margin-top:12px; background:rgba(255,255,255,0.96); border-radius:18px; padding:10px; border:1px solid var(--dash-border); box-shadow:0 18px 40px rgba(0,0,0,0.12); width:230px; backdrop-filter:blur(10px); z-index:10;}
.add-menu div { padding:9px 10px; border-radius:8px; cursor:pointer; transition:0.2s ease; }
.menu-label { font-size:12px; font-weight:800; color:var(--dash-accent); text-transform:uppercase; letter-spacing:0.6px; margin-top:6px; }
.add-menu div:hover { background: color-mix(in srgb,var(--dash-accent) 12%,#fff); }
.resize-handle-left, .resize-handle-bottom { opacity:0; transition:opacity 0.2s ease;}
.widget-shell:hover .resize-handle-left, .widget-shell:hover .resize-handle-bottom { opacity:0.8;}
.resize-handle-left { position:absolute; left:-6px; top:50%; transform:translateY(-50%); width:10px; height:60px; border-left:2px solid var(--dash-accent); cursor:ew-resize;}
.resize-handle-bottom { position:absolute; left:50%; bottom:-6px; transform:translateX(-50%); width:60px; height:10px; border-bottom:2px solid var(--dash-accent); cursor:ns-resize;}
.ghost { opacity:0.4;}
@keyframes fadeUp { from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
@media(max-width:992px){.widget-item{grid-column:span 6;}}
@media(max-width:640px){.widget-item{grid-column:span 12;}}
</style>