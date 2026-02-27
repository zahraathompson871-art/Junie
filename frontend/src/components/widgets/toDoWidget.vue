<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">✓</span>
        <h5 class="widget-title">Tasks</h5>
      </div>
      <div class="progress-pill" :class="{ complete: progress === 100 && tasks.length > 0 }">
        {{ completedTasks }}/{{ tasks.length }}
      </div>
    </div>

    <div class="progress-track" v-if="tasks.length">
      <div class="progress-fill" :style="{ width: progress + '%' }" :class="{ complete: progress === 100 }"></div>
    </div>

    <ul class="task-list" v-if="tasks.length">
      <li v-for="(task, index) in tasks" :key="index" class="task-item" :class="{ done: task.done }">
        <button class="check-btn" @click="task.done = !task.done" :class="{ checked: task.done }">
          <svg v-if="task.done" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="task-text">{{ task.text }}</span>
        <button class="delete-btn" @click="tasks.splice(index, 1)">
          <svg viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </li>
    </ul>

    <div v-if="!tasks.length" class="empty-state">Nothing here yet</div>

    <div class="add-area">
      <div v-if="showInput" class="input-row">
        <input ref="taskInput" v-model="newTask" @keyup.enter="addTask" @keyup.escape="cancelAdd" placeholder="New task..." class="task-input" />
        <button class="add-confirm" @click="addTask">Add</button>
        <button class="add-cancel" @click="cancelAdd">✕</button>
      </div>
      <button v-else class="add-trigger" @click="openInput">
        <span class="plus">+</span> Add task
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  emits: ['update:data'],
  data() {
    return { tasks: Array.isArray(this.data) ? [...this.data] : [], showInput: false, newTask: '' }
  },
  watch: {
    data: { handler(v) { this.tasks = Array.isArray(v) ? [...v] : [] }, deep: true },
    tasks: { handler(v) { this.$emit('update:data', v) }, deep: true }
  },
  computed: {
    completedTasks() { return this.tasks.filter(t => t.done).length },
    progress() { return this.tasks.length ? (this.completedTasks / this.tasks.length) * 100 : 0 }
  },
  methods: {
    openInput() { this.showInput = true; this.$nextTick(() => this.$refs.taskInput?.focus()) },
    addTask() { if (!this.newTask.trim()) return; this.tasks.push({ text: this.newTask.trim(), done: false }); this.newTask = ''; this.showInput = false },
    cancelAdd() { this.newTask = ''; this.showInput = false }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 12px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; }
.widget-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #f0ede8; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #5c5650; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.progress-pill { font-size: 11px; font-weight: 600; color: #8a867e; background: #f5f4f1; padding: 3px 9px; border-radius: 99px; transition: all 0.3s; }
.progress-pill.complete { background: #e8f5ee; color: #2d7a52; }
.progress-track { height: 3px; background: #f0ede8; border-radius: 99px; overflow: hidden; margin-top: -4px; }
.progress-fill { height: 100%; background: #3d3a35; border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
.progress-fill.complete { background: #3a9e6f; }
.task-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1px; flex: 1; overflow-y: auto; max-height: 260px; }
.task-item { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 8px; transition: background 0.15s; }
.task-item:hover { background: #faf9f7; }
.check-btn { width: 18px; height: 18px; min-width: 18px; border-radius: 5px; border: 1.5px solid #d4d0ca; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #fff; padding: 0; }
.check-btn.checked { background: #3d3a35; border-color: #3d3a35; }
.check-btn svg { width: 10px; height: 10px; }
.task-text { flex: 1; font-size: 13.5px; color: #2e2c29; line-height: 1.4; transition: all 0.2s; }
.task-item.done .task-text { text-decoration: line-through; color: #b0aca6; }
.delete-btn { width: 20px; height: 20px; border-radius: 4px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #c9c5bf; opacity: 0; transition: all 0.15s; padding: 0; }
.task-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { background: #f5e8e8; color: #b05050; }
.delete-btn svg { width: 9px; height: 9px; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #c0bbb5; font-size: 13px; padding: 20px 0; }
.add-area { margin-top: auto; }
.add-trigger { width: 100%; display: flex; align-items: center; gap: 6px; padding: 9px 12px; background: #faf9f7; border: 1.5px dashed #e0ddd8; border-radius: 10px; color: #a09890; font-size: 13px; cursor: pointer; transition: all 0.15s; }
.add-trigger:hover { background: #f0ede8; border-color: #c8c4be; color: #5c5650; }
.plus { font-size: 15px; line-height: 1; }
.input-row { display: flex; gap: 6px; }
.task-input { flex: 1; padding: 8px 12px; border: 1.5px solid #e0ddd8; border-radius: 9px; font-size: 13px; color: #2e2c29; background: #fff; outline: none; transition: border-color 0.15s; }
.task-input:focus { border-color: #3d3a35; }
.add-confirm { padding: 8px 14px; background: #3d3a35; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
.add-confirm:hover { background: #2a2823; }
.add-cancel { width: 34px; border: 1.5px solid #e0ddd8; background: #fff; border-radius: 8px; color: #a0998f; cursor: pointer; }
</style>