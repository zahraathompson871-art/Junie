<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">⧖</span>
        <h5 class="widget-title">Study Log</h5>
      </div>
      <div class="total-pill">{{ totalHours }}h {{ totalRemMins }}m total</div>
    </div>

    <div class="log-form">
      <input v-model="form.topic" placeholder="What did you study?" class="field" @keyup.enter="addSession" />
      <div class="form-row">
        <div class="mins-input">
          <input v-model.number="form.minutes" type="number" min="1" placeholder="25" class="field" />
          <span class="field-unit">min</span>
        </div>
        <button class="log-btn" @click="addSession">Log</button>
      </div>
    </div>

    <div class="sessions" v-if="sessions.length">
      <div class="session-item" v-for="(s, i) in sessions" :key="i">
        <div class="session-bar-wrap">
          <div class="session-bar" :style="{ width: Math.min((s.minutes / maxMinutes) * 100, 100) + '%' }"></div>
        </div>
        <div class="session-info">
          <span class="session-topic">{{ s.topic }}</span>
          <div class="session-meta">
            <span class="session-mins">{{ s.minutes }}m</span>
            <span class="session-date">{{ s.date }}</span>
          </div>
        </div>
        <button class="remove-btn" @click="sessions.splice(i, 1)">✕</button>
      </div>
    </div>

    <div v-else class="empty-state">No sessions logged yet</div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Array, default: () => [] } },
  emits: ['update:data'],
  data() {
    return { sessions: Array.isArray(this.data) ? [...this.data] : [], form: { topic: '', minutes: 25 } }
  },
  computed: {
    totalMinutes() { return this.sessions.reduce((s, x) => s + Number(x.minutes || 0), 0) },
    totalHours() { return Math.floor(this.totalMinutes / 60) },
    totalRemMins() { return this.totalMinutes % 60 },
    maxMinutes() { return Math.max(...this.sessions.map(s => s.minutes), 1) }
  },
  watch: {
    data: { handler(v) { this.sessions = Array.isArray(v) ? [...v] : [] }, deep: true },
    sessions: { handler(v) { this.$emit('update:data', v) }, deep: true }
  },
  methods: {
    addSession() {
      if (!this.form.topic.trim() || !this.form.minutes) return
      this.sessions.unshift({ topic: this.form.topic.trim(), minutes: Number(this.form.minutes), date: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' }) })
      this.form = { topic: '', minutes: 25 }
    }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 14px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; }
.widget-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #eef2ff; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #5060a0; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.total-pill { font-size: 11px; font-weight: 600; color: #8a867e; background: #f5f4f1; padding: 3px 9px; border-radius: 99px; }
.log-form { display: flex; flex-direction: column; gap: 6px; }
.field { padding: 8px 11px; border: 1.5px solid #eeecea; border-radius: 9px; font-size: 13px; color: #2e2c29; background: #faf9f7; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
.field:focus { border-color: #3d3a35; background: #fff; }
.field::placeholder { color: #c0bbb5; }
.form-row { display: flex; gap: 6px; align-items: center; }
.mins-input { position: relative; flex: 1; }
.mins-input .field { padding-right: 36px; }
.field-unit { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #b0aba3; font-weight: 500; pointer-events: none; }
.log-btn { padding: 8px 18px; background: #3d3a35; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
.log-btn:hover { background: #2a2823; }
.sessions { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; }
.session-item { display: flex; flex-direction: column; gap: 5px; }
.session-bar-wrap { height: 4px; background: #f0ede8; border-radius: 99px; overflow: hidden; }
.session-bar { height: 100%; background: linear-gradient(90deg, #5060a0, #7080d0); border-radius: 99px; transition: width 0.4s ease; }
.session-info { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.session-topic { font-size: 13px; font-weight: 500; color: #2e2c29; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.session-meta { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.session-mins { font-size: 12px; font-weight: 700; color: #5060a0; }
.session-date { font-size: 11px; color: #b0aba3; }
.remove-btn { border: none; background: none; color: #c9c5bf; cursor: pointer; font-size: 10px; padding: 0; opacity: 0; transition: all 0.15s; }
.session-item:hover .remove-btn { opacity: 1; }
.remove-btn:hover { color: #b05050; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #c0bbb5; font-size: 13px; }
</style>