<template>
  <div class="main">
    <div class="container mt-4">
      <!-- Dashboard Header -->
      <div class="dashboard-header mb-4">
        <h2 class="dashboard-title">My Dashboard</h2>
        <button class="btn add-widget" @click="showWidgetMenu = !showWidgetMenu">
          + Add Widget
        </button>
      </div>

      <!-- Widget Menu -->
      <transition name="fade">
        <div v-if="showWidgetMenu" class="widget-menu">
          <button class="btn widget-btn" @click="addWidgets('todo')">To-Do List</button>
          <button class="btn widget-btn" @click="addWidgets('goal')">Goal Tracker</button>
          <button class="btn widget-btn" @click="addWidgets('pomodoro')">Pomodoro Timer</button>
        </div>
      </transition>

      <!-- Widgets Grid -->
      <draggable v-model="widgets" class="widgets-grid" item-key="id" ghost-class="ghost">
        <template #item="{element}">
          <div class="widget-wrapper">
            <component
              v-if="resolveWidget(element.type)"
              :is="resolveWidget(element.type)"
              :data="element.data"
            />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import ToDoWidget from '../components/widgets/toDoWidget.vue';
import GoalWidget from '../components/widgets/goalWidget.vue';
import PomodoroWidget from '../components/widgets/pomodoroWidget.vue';

export default {
  components: { draggable, ToDoWidget, GoalWidget, PomodoroWidget },

  data() {
    return { showWidgetMenu: false, widgets: [], authToken: "", isDashboardLoaded: false, saveTimer: null };
  },

  async mounted() { await this.loadDashboard(); },

  beforeUnmount() { if (this.saveTimer) clearTimeout(this.saveTimer); },

  methods: {
    getDefaultWidgets() {
      return [
        { id: 1, type: "todo", data: [{ text: "Finish AI assignment", done: false }, { text: "Study 2 hours", done: false }] },
        { id: 2, type: "goal", data: { current: 3, total: 10, target: "Complete 10 study sessions" } },
        { id: 3, type: "pomodoro", data: {} }
      ];
    },

    async loadDashboard() {
      const token = localStorage.getItem("token");
      this.authToken = token || "";
      if (!this.authToken) { this.widgets = this.getDefaultWidgets(); this.isDashboardLoaded = true; return; }

      try {
        const response = await fetch("http://localhost:5000/api/users/dashboard", { headers: { Authorization: `Bearer ${this.authToken}` } });
        if (!response.ok) throw new Error("Failed to load dashboard");

        const dashboard = await response.json();
        if (Array.isArray(dashboard) && dashboard.length > 0) this.widgets = dashboard;
        else { this.widgets = this.getDefaultWidgets(); await this.saveDashboard(); }
      } catch (err) { this.widgets = this.getDefaultWidgets(); }
      finally { this.isDashboardLoaded = true; }
    },

    async saveDashboard() { if (!this.authToken) return; await fetch("http://localhost:5000/api/users/dashboard", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.authToken}` }, body: JSON.stringify({ dashboard: this.widgets }) }); },

    queueSave() { if (!this.isDashboardLoaded) return; if (this.saveTimer) clearTimeout(this.saveTimer); this.saveTimer = setTimeout(() => this.saveDashboard(), 250); },

    resolveWidget(type) { const map = { todo: ToDoWidget, goal: GoalWidget, pomodoro: PomodoroWidget }; return map[type] || null; },

    addWidgets(type) { this.widgets.push({ id: Date.now(), type, data: this.getDefaultData(type) }); this.showWidgetMenu = false; },

    getDefaultData(type) { const defaults = { todo: [{ text: 'New Task', done: false }], goal: { current: 0, total: 10, target: 'New Goal' }, pomodoro: {} }; return defaults[type] || {}; }
  },

  watch: { widgets: { handler() { this.queueSave(); }, deep: true } }
};
</script>

<style scoped>
/* ===== Main Background ===== */
.main { flex: 1; min-height: 100vh; background: linear-gradient(135deg,#f5f7fa,#c3cfe2); padding-bottom: 2rem; font-family: 'Segoe UI', sans-serif; }

/* ===== Header ===== */
.dashboard-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 2rem; }
.dashboard-title { font-size: 3rem; font-weight: 700; background: linear-gradient(90deg,#4a90e2,#2ecc71); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.btn.add-widget { padding: 0.8rem 1.6rem; font-weight: 600; border-radius: 12px; background: #4a90e2; color: #fff; border: none; box-shadow: 0 6px 15px rgba(0,0,0,0.2); transition: 0.3s; }
.btn.add-widget:hover { background: #3d7cc4; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.25); }

/* ===== Widget Menu ===== */
.widget-menu { background: #fff; border-radius: 12px; padding: 1rem; margin-bottom: 2rem; box-shadow: 0 6px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 0.6rem; }
.widget-menu .widget-btn { padding: 0.6rem 1rem; border-radius: 10px; font-weight: 600; border: 2px solid #4a90e2; color: #4a90e2; background: transparent; transition: 0.3s; }
.widget-menu .widget-btn:hover { background: #4a90e2; color: #fff; transform: translateY(-1px); }

/* ===== Widgets Grid ===== */
.widgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px,1fr)); gap: 2rem; }

/* ===== Widget Cards ===== */
.widget-wrapper .widget-card { 
  background: linear-gradient(145deg,#ffffff,#f9f9f9); 
  border-radius: 18px; 
  padding: 1.5rem; 
  box-shadow: 0 12px 30px rgba(0,0,0,0.12); 
  transition: transform 0.3s, box-shadow 0.3s; 
  min-height: 220px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  border-left: 6px solid #4a90e2; 
}
.widget-wrapper .widget-card:hover { transform: translateY(-5px); box-shadow: 0 18px 35px rgba(0,0,0,0.2); }

/* ===== Ghost for Drag ===== */
.ghost { opacity: 0.5; border: 2px dashed #4a90e2; }

/* ===== Fade Transition ===== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== Make widget content bigger ===== */
.widget-card h5 { font-size: 1.3rem; font-weight: 600; }
.widget-card p, .widget-card .percentage, .widget-card .task-text { font-size: 1rem; }
.widget-card .progress-wrapper { height: 12px; }
.widget-card .progress-bar { height: 100%; }
.widget-card .timer-display { font-size: 3rem; font-weight: 700; }
.widget-card .button-group .btn { padding: 0.7rem 1.2rem; font-size: 14px; }
.widget-card .checkbox { width: 20px; height: 20px; }
</style>