<template>
  <div class="widget">
    <div class="widget-header">
      <div class="header-left">
        <span class="widget-icon">◈</span>
        <h5 class="widget-title">Calendar</h5>
      </div>
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">‹</button>
        <span class="month-label">{{ monthName }} {{ currentYear }}</span>
        <button class="nav-btn" @click="nextMonth">›</button>
      </div>
    </div>

    <div class="calendar-grid">
      <span class="day-label" v-for="d in weekdays" :key="d">{{ d }}</span>
      <span
        v-for="(blank, i) in firstDayOffset"
        :key="'blank-' + i"
        class="day-cell empty"
      ></span>
      <span
        v-for="day in daysInMonth"
        :key="day"
        class="day-cell"
        :class="{
          today: isToday(day),
          'other-month': false
        }"
      >{{ day }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: { data: { type: Object, default: () => ({}) } },
  emits: ['update:data'],
  data() {
    const today = new Date()
    return {
      currentMonth: Number(this.data?.currentMonth ?? today.getMonth()),
      currentYear: Number(this.data?.currentYear ?? today.getFullYear()),
      weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  },
  watch: {
    data: { handler(v) { const t = new Date(); this.currentMonth = Number(v?.currentMonth ?? t.getMonth()); this.currentYear = Number(v?.currentYear ?? t.getFullYear()) }, deep: true },
    currentMonth() { this.emitState() },
    currentYear() { this.emitState() }
  },
  computed: {
    monthName() { return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' }) },
    daysInMonth() { return Array.from({ length: new Date(this.currentYear, this.currentMonth + 1, 0).getDate() }, (_, i) => i + 1) },
    firstDayOffset() { return Array(new Date(this.currentYear, this.currentMonth, 1).getDay()) }
  },
  methods: {
    emitState() { this.$emit('update:data', { currentMonth: this.currentMonth, currentYear: this.currentYear }) },
    isToday(day) { const t = new Date(); return day === t.getDate() && this.currentMonth === t.getMonth() && this.currentYear === t.getFullYear() },
    prevMonth() { if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear-- } else { this.currentMonth-- } },
    nextMonth() { if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++ } else { this.currentMonth++ } }
  }
}
</script>

<style scoped>
.widget { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #eeecea; display: flex; flex-direction: column; gap: 16px; font-family: 'DM Sans', 'Helvetica Neue', sans-serif; height: 100%; box-sizing: border-box; }
.widget-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.header-left { display: flex; align-items: center; gap: 8px; }
.widget-icon { width: 26px; height: 26px; background: #eef2ff; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #5060a0; }
.widget-title { margin: 0; font-size: 14px; font-weight: 600; color: #1a1917; letter-spacing: -0.01em; }
.month-nav { display: flex; align-items: center; gap: 8px; }
.nav-btn { width: 24px; height: 24px; border: 1px solid #e8e5e0; border-radius: 6px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #6b6760; transition: all 0.15s; }
.nav-btn:hover { background: #f5f3f0; border-color: #d0cdc8; }
.month-label { font-size: 12.5px; font-weight: 600; color: #3a3835; min-width: 110px; text-align: center; letter-spacing: -0.01em; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.day-label { text-align: center; font-size: 10.5px; font-weight: 700; color: #b0aba3; text-transform: uppercase; letter-spacing: 0.04em; padding: 4px 0 6px; }
.day-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 12.5px; color: #3a3835; border-radius: 7px; cursor: default; transition: background 0.12s; font-weight: 400; }
.day-cell:not(.empty):hover { background: #f5f3f0; }
.day-cell.today { background: #1a1917; color: #fff; font-weight: 700; }
.day-cell.empty { pointer-events: none; }
</style>