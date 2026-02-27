<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">◻</span>
        <h5 class="widget-title">Assignments</h5>
      </div>
      <div class="score-pill" :class="{ complete: completed === assignments.length && assignments.length > 0 }">
        {{ completed }}/{{ assignments.length }} done
      </div>
    </div>

    <div class="add-form">
      <input v-model="form.title" placeholder="Assignment name" class="field" @keyup.enter="addAssignment" />
      <div class="form-row">
        <input v-model="form.course" placeholder="Course" class="field" />
        <input v-model="form.dueDate" type="date" class="field date-field" />
        <button class="add-btn" @click="addAssignment">Add</button>
      </div>
    </div>

    <ul class="list" v-if="assignments.length">
      <li v-for="(item, i) in assignments" :key="i" class="item" :class="{ done: item.done }">
        <button class="check" @click="item.done = !item.done" :class="{ checked: item.done }">
          <svg v-if="item.done" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="item-body">
          <span class="item-title">{{ item.title }}</span>
          <div class="item-meta">
            <span v-if="item.course" class="course-tag">{{ item.course }}</span>
            <span v-if="item.dueDate" class="due-tag" :class="{ overdue: isOverdue(item.dueDate) && !item.done }">{{ formatDate(item.dueDate) }}</span>
          </div>
        </div>
        <button class="remove" @click="assignments.splice(i, 1)">✕</button>
      </li>
    </ul>

    <div v-else class="empty-state">No assignments yet</div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Array, default: () => [] } },
  emits: ['update:data'],
  data() {
    return {
      assignments: Array.isArray(this.data) ? [...this.data] : [],
      form: { title: '', course: '', dueDate: '' }
    }
  },
  computed: {
    completed() { return this.assignments.filter(a => a.done).length }
  },
  watch: {
    data: { handler(v) { this.assignments = Array.isArray(v) ? [...v] : [] }, deep: true },
    assignments: { handler(v) { this.$emit('update:data', v) }, deep: true }
  },
  methods: {
    addAssignment() {
      if (!this.form.title.trim()) return
      this.assignments.push({ title: this.form.title.trim(), course: this.form.course.trim(), dueDate: this.form.dueDate, done: false })
      this.form = { title: '', course: '', dueDate: '' }
    },
    formatDate(d) { if (!d) return ''; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' }) },
    isOverdue(d) { if (!d) return false; return new Date(d + 'T00:00:00') < new Date() }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 14px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; }
.widget-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #eefaf4; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #3a9e6f; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.score-pill { font-size: 11px; font-weight: 600; color: #8a867e; background: #f5f4f1; padding: 3px 9px; border-radius: 99px; transition: all 0.3s; }
.score-pill.complete { background: #e8f5ee; color: #2d7a52; }
.add-form { display: flex; flex-direction: column; gap: 6px; }
.field { padding: 8px 11px; border: 1.5px solid #eeecea; border-radius: 9px; font-size: 13px; color: #2e2c29; background: #faf9f7; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
.field:focus { border-color: #3d3a35; background: #fff; }
.field::placeholder { color: #c0bbb5; }
.form-row { display: flex; gap: 6px; align-items: center; }
.form-row .field { flex: 1; }
.date-field { min-width: 0; }
.add-btn { padding: 8px 14px; background: #3d3a35; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
.add-btn:hover { background: #2a2823; }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
.item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 8px; border-radius: 10px; transition: background 0.15s; }
.item:hover { background: #faf9f7; }
.check { width: 18px; height: 18px; min-width: 18px; margin-top: 1px; border-radius: 5px; border: 1.5px solid #d4d0ca; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #fff; padding: 0; }
.check.checked { background: #3d3a35; border-color: #3d3a35; }
.check svg { width: 10px; height: 10px; }
.item-body { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.item-title { font-size: 13.5px; color: #2e2c29; font-weight: 500; transition: all 0.2s; }
.item.done .item-title { text-decoration: line-through; color: #b0aca6; }
.item-meta { display: flex; gap: 5px; flex-wrap: wrap; }
.course-tag { font-size: 10.5px; font-weight: 600; color: #6080b0; background: #eef2ff; padding: 2px 7px; border-radius: 5px; }
.due-tag { font-size: 10.5px; font-weight: 600; color: #7a7060; background: #f5f0e8; padding: 2px 7px; border-radius: 5px; }
.due-tag.overdue { color: #c05040; background: #fdeee8; }
.remove { width: 20px; height: 20px; border: none; background: transparent; color: #c9c5bf; cursor: pointer; font-size: 10px; opacity: 0; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
.item:hover .remove { opacity: 1; }
.remove:hover { color: #b05050; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #c0bbb5; font-size: 13px; }
</style>