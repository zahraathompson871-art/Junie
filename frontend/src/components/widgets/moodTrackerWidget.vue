<template>
  <div class="widget-card">
    <div class="header">
      <h5 class="title">Mood Tracker</h5>
      <span class="meta">{{ entries.length }} entries</span>
    </div>

    <div class="moods">
      <button v-for="m in moods" :key="m.label" class="mood-btn" @click="addMood(m)">
        {{ m.emoji }} {{ m.label }}
      </button>
    </div>

    <ul class="items" v-if="entries.length">
      <li v-for="(entry, index) in entries" :key="index">
        <span>{{ entry.emoji }} {{ entry.label }}</span>
        <small>{{ entry.date }}</small>
      </li>
    </ul>
    <p v-else class="empty">No moods logged today.</p>
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
      entries: Array.isArray(this.data) ? [...this.data] : [],
      moods: [
        { label: 'Great', emoji: '😀' },
        { label: 'Okay', emoji: '🙂' },
        { label: 'Low', emoji: '😕' },
        { label: 'Tired', emoji: '😴' }
      ]
    }
  },
  watch: {
    data: {
      handler(value) {
        this.entries = Array.isArray(value) ? [...value] : []
      },
      deep: true
    },
    entries: {
      handler(value) {
        this.$emit('update:data', value)
      },
      deep: true
    }
  },
  methods: {
    addMood(mood) {
      this.entries.unshift({
        label: mood.label,
        emoji: mood.emoji,
        date: new Date().toLocaleString()
      })
      if (this.entries.length > 20) this.entries.pop()
    }
  }
}
</script>

<style scoped>
.header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.title { margin: 0; font-size: 15px; color: #37352f; }
.meta { font-size: 12px; color: #6f6b64; }
.moods { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; }
.mood-btn { border: 1px solid #ddd8d0; background: #f7f5f2; border-radius: 6px; color: #37352f; padding: 6px 8px; text-align: left; }
.items { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
li { display: flex; justify-content: space-between; font-size: 13px; color: #37352f; }
small { color: #8a867e; }
.empty { margin: 0; color: #8a867e; font-size: 13px; }
</style>
