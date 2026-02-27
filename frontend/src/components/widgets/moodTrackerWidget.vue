<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">◉</span>
        <h5 class="widget-title">Mood</h5>
      </div>
      <span class="entry-count">{{ entries.length }} logged</span>
    </div>

    <div class="mood-grid">
      <button
        v-for="m in moods"
        :key="m.label"
        class="mood-btn"
        :style="{ '--accent': m.color }"
        @click="addMood(m)"
      >
        <span class="mood-emoji">{{ m.emoji }}</span>
        <span class="mood-label">{{ m.label }}</span>
      </button>
    </div>

    <div class="log" v-if="entries.length">
      <div class="log-entry" v-for="(entry, i) in entries.slice(0, 5)" :key="i">
        <span class="log-emoji">{{ entry.emoji }}</span>
        <div class="log-info">
          <span class="log-mood">{{ entry.label }}</span>
          <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
        </div>
        <button class="log-remove" @click="entries.splice(i, 1)">✕</button>
      </div>
    </div>

    <div v-else class="empty-state">Log how you're feeling today</div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Array, default: () => [] } },
  emits: ['update:data'],
  data() {
    return {
      entries: Array.isArray(this.data) ? [...this.data] : [],
      moods: [
        { label: 'Great', emoji: '😄', color: '#4db87a' },
        { label: 'Good', emoji: '🙂', color: '#6ca8e0' },
        { label: 'Okay', emoji: '😐', color: '#e0b86c' },
        { label: 'Low', emoji: '😔', color: '#c07070' }
      ]
    }
  },
  watch: {
    data: { handler(v) { this.entries = Array.isArray(v) ? [...v] : [] }, deep: true },
    entries: { handler(v) { this.$emit('update:data', v) }, deep: true }
  },
  methods: {
    addMood(mood) {
      this.entries.unshift({ label: mood.label, emoji: mood.emoji, timestamp: Date.now() })
      if (this.entries.length > 30) this.entries.pop()
    },
    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 14px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; }
.widget-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #f8eeff; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #9060c0; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.entry-count { font-size: 11px; font-weight: 600; color: #b0aba3; background: #f5f4f1; padding: 3px 9px; border-radius: 99px; }
.mood-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.mood-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 6px; background: #faf9f7; border: 1.5px solid #eeecea; border-radius: 12px; cursor: pointer; transition: all 0.15s; }
.mood-btn:hover { background: color-mix(in srgb, var(--accent) 12%, #fff); border-color: color-mix(in srgb, var(--accent) 40%, #eeecea); transform: translateY(-1px); }
.mood-emoji { font-size: 22px; line-height: 1; }
.mood-label { font-size: 10.5px; font-weight: 600; color: #8a867e; letter-spacing: 0.01em; }
.log { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
.log-entry { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #faf9f7; border-radius: 10px; transition: background 0.15s; }
.log-entry:hover { background: #f5f3f0; }
.log-emoji { font-size: 18px; line-height: 1; }
.log-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.log-mood { font-size: 13px; font-weight: 600; color: #2e2c29; }
.log-time { font-size: 11px; color: #b0aba3; }
.log-remove { width: 20px; height: 20px; border: none; background: transparent; color: #c9c5bf; cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.15s; }
.log-remove:hover { background: #f5e8e8; color: #b05050; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #c0bbb5; font-size: 13px; padding: 12px 0; }
</style>