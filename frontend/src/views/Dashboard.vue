<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">My Dashboard</h2>
      <div class="row g-4 mb-4">
        <div class="col-md-12">

          <div class="d-flex justify-content-between align-items-center mb-3"></div>
          <h5>Widgets</h5>
          <button class="btn btn-dark" @click="showWidgetMenu = !showWidgetMenu" >
            + Add Widget
          </button>

          <div v-if="showWidgetMenu" class="widget-menu">
            <button class="btn btn-outline-dark w-100 mb-2" @click="addWidgets('todo')">
              To-Do List
            </button>
            <button class="btn btn-outline-dark w-100 mb-2" @click="addWidgets('goal')">
              Goal Tracker
            </button>
            <button class="btn btn-outline-dark w-100 mb-2" @click="addWidgets('pomodoro')">
              Pomodoro Timer
            </button>
          </div>

          <draggable v-model="widgets" class="row g-4" item-key="id" ghost-class="ghost">
            <template #item="{element}">
              <div class="col-md-4">
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
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import ToDoWidget from '../components/widgets/toDoWidget.vue';
import GoalWidget from '../components/widgets/goalWidget.vue';
import pomodoroWidget from '../components/widgets/pomodoroWidget.vue';

export default {
  components:{
    draggable,
    ToDoWidget,
    GoalWidget,
    pomodoroWidget
  },

  data() {
    return {
      showWidgetMenu: false,
      widgets: [],
      authToken: "",
      isDashboardLoaded: false,
      saveTimer: null
    };
  },
  async mounted() {
    await this.loadDashboard();
  },
  beforeUnmount() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  },
  methods: {
    getDefaultWidgets() {
      return [
        {
          id: 1,
          type: "todo",
          data: [
            { text: "Finish AI assignment", done: false },
            { text: "Study 2 hours", done: false }
          ]
        },
        {
          id: 2,
          type: "goal",
          data: { current: 3, total: 10, target: "Complete 10 study sessions" }
        },
        {
          id: 3,
          type: "pomodoro",
          data: {}
        }
      ];
    },
    async loadDashboard() {
      const token = localStorage.getItem("token");
      this.authToken = token || "";

      if (!this.authToken) {
        this.widgets = this.getDefaultWidgets();
        this.isDashboardLoaded = true;
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/users/dashboard", {
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        });

        if (!response.ok) throw new Error("Failed to load dashboard");

        const dashboard = await response.json();
        if (Array.isArray(dashboard) && dashboard.length > 0) {
          this.widgets = dashboard;
        } else {
          this.widgets = this.getDefaultWidgets();
          await this.saveDashboard();
        }
      } catch (err) {
        this.widgets = this.getDefaultWidgets();
      } finally {
        this.isDashboardLoaded = true;
      }
    },
    async saveDashboard() {
      if (!this.authToken) return;

      await fetch("http://localhost:5000/api/users/dashboard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ dashboard: this.widgets })
      });
    },
    queueSave() {
      if (!this.isDashboardLoaded) return;
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.saveDashboard();
      }, 250);
    },
    resolveWidget(type) {
      const map = {
        todo: ToDoWidget,
        goal: GoalWidget,
        pomodoro: pomodoroWidget
      };
      return map[type] || null;
    },
    addWidgets(type) {
      const newWidget = {
        id: Date.now(),
        type,
        data: this.getDefaultData(type)
      };
      this.widgets.push(newWidget);
      this.showWidgetMenu = false;
    },
    getDefaultData(type) {
      const defaults = {
        todo: [
          { text: 'New Task ', done: false }
        ],
        goal: { current: 0, total: 10, target: 'New Goal' },
        pomodoro: {}
      };
      return defaults[type] || {};
    }
  },

  watch:{
    widgets:{
      handler(){
        this.queueSave();
      },
      deep: true
    }
  }
};



</script>

<style scoped>
.main {
  flex: 1;
  overflow-y: auto;
  background-color: #fdfdf6; /* cream background */
  color: #121212;            /* black text */
}

.text-glow {
  color: #121212;
  font-weight: 600;
}

.stat-block, .progress-block, .motivation-block, .challenge-block,
.notification-block, .community-block, .task-block, .goal-block, .graph-block {
  background-color: #ffffff; /* white cards */
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Task list */
.task-list {
  list-style: none;
  padding-left: 0;
}
.task-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.completed {
  text-decoration: line-through;
  color: #888;
}

/* Progress bars */
.progress {
  background-color: #f2f2f2; /* cream progress background */
  border-radius: 8px;
  overflow: hidden;
}
.progress-bar {
  height: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #121212; /* black bar */
  color: #fff;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-glow {
  background-color: #121212; /* black button */
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}
.btn-outline {
  border: 1px solid #121212;
  color: #121212;
  background: transparent;
}
.btn-outline:hover {
  background-color: #121212;
  color: #fff;
}



.ghost {
  opacity: 0.4;
}

.widget-card{
  background-color: #ffffff; 
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  cursor: grab;
}

.widget-card:active {
  cursor: grabbing;
}

.widget-menu {
  background-color: #ffffff; 
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
</style>
