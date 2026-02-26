<template>
  <div class="widget-card">
    <div class="header">
      <h5 class="title">Study Session Log</h5>
      <span class="meta">{{ totalMinutes }} min</span>
    </div>

    <div class="add-row">
      <input v-model="form.topic" placeholder="Topic" />
      <input v-model.number="form.minutes" type="number" min="1" placeholder="Minutes" />
      <button class="btn-add" @click="addSession">Log</button>
    </div>

    <ul class="items" v-if="sessions.length">
      <li v-for="(item, index) in sessions" :key="index">
        <div class="text">
          <strong>{{ item.topic }}</strong>
          <small>{{ item.minutes }} min · {{ item.date }}</small>
        </div>
        <button class="btn-remove" @click="remove(index)">x</button>
      </li>
    </ul>
    <p v-else class="empty">No sessions logged.</p>
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
      sessions: Array.isArray(this.data) ? [...this.data] : [],
      form: { topic: '', minutes: 25 }
    }
  },
  computed: {
    totalMinutes() {
      return this.sessions.reduce((sum, s) => sum + Number(s.minutes || 0), 0)
    }
  },
  watch: {
    data: {
      handler(value) {
        this.sessions = Array.isArray(value) ? [...value] : []
      },
      deep: true
    },
    sessions: {
      handler(value) {
        this.$emit('update:data', value)
      },
      deep: true
    }
  },
  methods: {
    addSession() {
      if (!this.form.topic.trim() || !this.form.minutes) return
      this.sessions.unshift({
        topic: this.form.topic.trim(),
        minutes: Number(this.form.minutes),
        date: new Date().toLocaleDateString()
      })
      this.form = { topic: '', minutes: 25 }
    },
    remove(index) {
      this.sessions.splice(index, 1)
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
.empty { margin: 0; color: #8a867e; font-size: 13px; }
</style>
