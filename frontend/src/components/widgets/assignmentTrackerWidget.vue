<template>
  <div class="widget-card">
    <div class="header">
      <h5 class="title">Assignment Tracker</h5>
      <span class="meta">{{ completed }}/{{ assignments.length }}</span>
    </div>

    <div class="add-row">
      <input v-model="form.title" placeholder="Assignment" />
      <input v-model="form.course" placeholder="Course" />
      <input v-model="form.dueDate" type="date" />
      <button class="btn-add" @click="addAssignment">Add</button>
    </div>

    <ul class="items" v-if="assignments.length">
      <li v-for="(item, index) in assignments" :key="index">
        <input type="checkbox" v-model="item.done" />
        <div class="text">
          <strong :class="{ done: item.done }">{{ item.title }}</strong>
          <small>{{ item.course }} · {{ item.dueDate || 'No due date' }}</small>
        </div>
        <button class="btn-remove" @click="remove(index)">x</button>
      </li>
    </ul>
    <p v-else class="empty">No assignments yet.</p>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:data'],
  data() {
    return {
      assignments: Array.isArray(this.data) ? [...this.data] : [],
      form: { title: '', course: '', dueDate: '' }
    }
  },
  computed: {
    completed() {
      return this.assignments.filter(a => a.done).length
    }
  },
  watch: {
    data: {
      handler(value) {
        this.assignments = Array.isArray(value) ? [...value] : []
      },
      deep: true
    },
    assignments: {
      handler(value) {
        this.$emit('update:data', value)
      },
      deep: true
    }
  },
  methods: {
    addAssignment() {
      if (!this.form.title.trim()) return
      this.assignments.push({
        title: this.form.title.trim(),
        course: this.form.course.trim(),
        dueDate: this.form.dueDate,
        done: false
      })
      this.form = { title: '', course: '', dueDate: '' }
    },
    remove(index) {
      this.assignments.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.header, .add-row, li { display: flex; gap: 8px; align-items: center; }
.header { justify-content: space-between; margin-bottom: 8px; }
.title { margin: 0; font-size: 15px; color: #37352f; }
.meta { font-size: 12px; color: #6f6b64; }
.add-row { margin-bottom: 10px; flex-wrap: wrap; }
input { border: 1px solid #ddd8d0; border-radius: 6px; padding: 6px 8px; background: #fbfaf8; color: #37352f; }
.btn-add, .btn-remove { border: 1px solid #ddd8d0; background: #f7f5f2; border-radius: 6px; color: #37352f; padding: 6px 8px; }
.items { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.done { text-decoration: line-through; color: #8a867e; }
.empty { margin: 0; color: #8a867e; font-size: 13px; }
</style>
