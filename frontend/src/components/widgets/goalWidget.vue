<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">◎</span>
        <h5 class="widget-title">Goal Tracker</h5>
      </div>
      <span class="pct-badge" :class="{ done: percentage >= 100 }">{{ Math.round(percentage) }}%</span>
    </div>

    <input class="goal-name" v-model="goal.target" placeholder="What's your goal?" />

    <div class="progress-section">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: Math.min(percentage, 100) + '%' }" :class="{ done: percentage >= 100 }"></div>
      </div>
      <div class="progress-label">{{ goal.current }} / {{ goal.total }}</div>
    </div>

    <div class="counters">
      <div class="counter-group">
        <label>Current</label>
        <div class="stepper">
          <button @click="goal.current = Math.max(0, goal.current - 1)">−</button>
          <input type="number" v-model.number="goal.current" min="0" />
          <button @click="goal.current++">+</button>
        </div>
      </div>
      <div class="divider"></div>
      <div class="counter-group">
        <label>Target</label>
        <div class="stepper">
          <button @click="goal.total = Math.max(1, goal.total - 1)">−</button>
          <input type="number" v-model.number="goal.total" min="1" />
          <button @click="goal.total++">+</button>
        </div>
      </div>
    </div>

    <div v-if="percentage >= 100" class="celebration">
      🎉 Goal complete!
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  emits: ['update:data'],
  data() {
    return {
      goal: {
        current: Number(this.data?.current ?? 0),
        total: Number(this.data?.total ?? 10),
        target: this.data?.target || ''
      }
    }
  },
  watch: {
    data: { handler(v) { this.goal = { current: Number(v?.current ?? 0), total: Number(v?.total ?? 10), target: v?.target || '' } }, deep: true },
    goal: { handler(v) { this.$emit('update:data', v) }, deep: true }
  },
  computed: {
    percentage() { return this.goal.total ? Math.min((this.goal.current / this.goal.total) * 100, 100) : 0 }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 14px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; container-type: inline-size; min-width: 0; }
.widget-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #fff4e8; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #b06a20; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.pct-badge { font-size: 13px; font-weight: 700; color: #8a867e; background: #f5f4f1; padding: 3px 10px; border-radius: 99px; transition: all 0.3s; }
.pct-badge.done { background: #e8f5ee; color: #2d7a52; }
.goal-name { width: 100%; padding: 10px 12px; border: 1.5px solid #eeecea; border-radius: 10px; font-size: 13.5px; color: #2e2c29; background: #faf9f7; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
.goal-name:focus { border-color: #b06a20; background: #fff; }
.goal-name::placeholder { color: #c0bbb5; }
.progress-section { display: flex; flex-direction: column; gap: 6px; }
.progress-track { height: 10px; background: #f0ede8; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #c8813a, #e8a050); border-radius: 99px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
.progress-fill.done { background: linear-gradient(90deg, #3a9e6f, #5dbf8a); }
.progress-label { font-size: 11px; color: #a0998f; text-align: right; font-weight: 500; letter-spacing: 0.02em; }
.counters { display: flex; align-items: center; gap: 12px; }
.counter-group { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.counter-group label { font-size: 10.5px; font-weight: 700; color: #b0aba3; text-transform: uppercase; letter-spacing: 0.06em; }
.stepper { display: flex; align-items: center; border: 1.5px solid #eeecea; border-radius: 10px; overflow: hidden; background: #fff; }
.stepper button { width: 32px; height: 34px; border: none; background: #faf9f7; color: #5c5650; font-size: 16px; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
.stepper button:hover { background: #f0ede8; }
.stepper input { flex: 1; border: none; text-align: center; font-size: 13.5px; font-weight: 600; color: #2e2c29; background: transparent; outline: none; min-width: 0; padding: 0; }
.divider { width: 1px; height: 48px; background: #eeecea; }
.celebration { text-align: center; padding: 10px; background: #e8f5ee; border-radius: 10px; font-size: 13px; font-weight: 600; color: #2d7a52; }

@container (max-width: 360px) {
  .widget { padding: 14px; gap: 10px; }
  .widget-header { align-items: flex-start; gap: 8px; }
  .header-left { min-width: 0; }
  .widget-title { font-size: 13px; }
  .pct-badge { font-size: 11px; padding: 2px 8px; }
  .goal-name { padding: 8px 10px; font-size: 12.5px; }
  .progress-track { height: 8px; }
  .counters { flex-direction: column; align-items: stretch; gap: 8px; }
  .divider { display: none; }
}
</style>
