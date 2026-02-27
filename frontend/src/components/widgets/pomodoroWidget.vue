<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">◷</span>
        <h5 class="widget-title">Focus Timer</h5>
      </div>
      <span class="status-dot" :class="{ active: isRunning }"></span>
    </div>

    <div class="timer-ring-wrap">
      <svg class="ring" viewBox="0 0 100 100">
        <circle class="ring-bg" cx="50" cy="50" r="42" />
        <circle
          class="ring-fill"
          cx="50" cy="50" r="42"
          :stroke-dasharray="`${ringProgress * 2.638} 263.8`"
          :class="{ done: time === 0 }"
        />
      </svg>
      <div class="timer-display">
        <span class="timer-mins">{{ minutes }}</span>
        <span class="timer-colon">:</span>
        <span class="timer-secs">{{ seconds }}</span>
      </div>
    </div>

    <div class="duration-row">
      <button class="dur-btn" v-for="d in durations" :key="d" @click="setDuration(d)" :class="{ active: initialTime === d * 60 }">
        {{ d }}m
      </button>
    </div>

    <div class="controls">
      <button class="ctrl-btn secondary" @click="reset">
        <svg viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 1 0 1.5-3.5L3 6V2H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="ctrl-btn primary" @click="toggleTimer">
        <svg v-if="!isRunning" viewBox="0 0 16 16" fill="none"><path d="M5 3l9 5-9 5V3z" fill="currentColor"/></svg>
        <svg v-else viewBox="0 0 16 16" fill="none"><rect x="4" y="3" width="3" height="10" fill="currentColor" rx="1"/><rect x="9" y="3" width="3" height="10" fill="currentColor" rx="1"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Object, default: () => ({}) } },
  emits: ['update:data'],
  data() {
    return {
      time: Number(this.data?.time ?? 1500),
      initialTime: Number(this.data?.initialTime ?? 1500),
      interval: null,
      durations: [5, 15, 25, 45]
    }
  },
  computed: {
    minutes() { return String(Math.floor(this.time / 60)).padStart(2, '0') },
    seconds() { return String(this.time % 60).padStart(2, '0') },
    isRunning() { return this.interval !== null },
    ringProgress() { return this.initialTime ? ((this.initialTime - this.time) / this.initialTime) * 100 : 0 }
  },
  watch: {
    time() { this.$emit('update:data', { time: this.time, initialTime: this.initialTime }) },
    data: { handler(v) { if (typeof v?.time === 'number') this.time = v.time; if (typeof v?.initialTime === 'number') this.initialTime = v.initialTime }, deep: true }
  },
  methods: {
    toggleTimer() { this.isRunning ? this.pause() : this.start() },
    start() {
      if (this.interval || this.time === 0) return
      this.interval = setInterval(() => { if (this.time > 0) { this.time-- } else { this.pause() } }, 1000)
    },
    pause() { clearInterval(this.interval); this.interval = null },
    reset() { this.pause(); this.time = this.initialTime },
    setDuration(mins) { this.pause(); this.initialTime = mins * 60; this.time = mins * 60 }
  },
  beforeUnmount() { this.pause() }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 16px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; align-items: center; }
.widget-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #fdeef0; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #c05060; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; transition: all 0.3s; }
.status-dot.active { background: #e05060; box-shadow: 0 0 0 3px rgba(224,80,96,0.2); }
.timer-ring-wrap { position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
.ring { position: absolute; inset: 0; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: #f0ede8; stroke-width: 6; }
.ring-fill { fill: none; stroke: #3d3a35; stroke-width: 6; stroke-linecap: round; transition: stroke-dasharray 0.5s linear; }
.ring-fill.done { stroke: #3a9e6f; }
.timer-display { position: relative; display: flex; align-items: baseline; gap: 1px; }
.timer-mins, .timer-secs { font-size: 32px; font-weight: 700; color: #1a1917; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; line-height: 1; }
.timer-colon { font-size: 28px; font-weight: 700; color: #a0998f; margin: 0 1px; line-height: 1; }
.duration-row { display: flex; gap: 6px; }
.dur-btn { flex: 1; padding: 6px; background: #f5f4f1; border: 1.5px solid transparent; border-radius: 8px; font-size: 12px; font-weight: 600; color: #8a867e; cursor: pointer; transition: all 0.15s; }
.dur-btn.active { background: #1a1917; color: #fff; border-color: #1a1917; }
.dur-btn:hover:not(.active) { background: #ece9e4; color: #5c5650; }
.controls { display: flex; align-items: center; gap: 12px; }
.ctrl-btn { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.ctrl-btn.secondary { width: 40px; height: 40px; background: #f5f4f1; border-radius: 12px; color: #6b6760; }
.ctrl-btn.secondary:hover { background: #ece9e4; }
.ctrl-btn.secondary svg { width: 16px; height: 16px; }
.ctrl-btn.primary { width: 56px; height: 56px; background: #1a1917; border-radius: 16px; color: #fff; }
.ctrl-btn.primary:hover { background: #2d2b28; transform: scale(1.03); }
.ctrl-btn.primary svg { width: 18px; height: 18px; }
</style>