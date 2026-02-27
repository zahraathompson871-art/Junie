<template>
  <div class="widget-card">
    <div class="header">
      <h5 class="title">Goals</h5>
      <span class="percentage">{{ Math.round(percentage) }}%</span>
    </div>

    <input class="goal-input target" v-model="goal.target" placeholder="Goal target" />

    <div class="inputs">
      <input class="goal-input" type="number" min="0" v-model.number="goal.current" />
      <input class="goal-input" type="number" min="1" v-model.number="goal.total" />
    </div>

    <div class="progress-wrapper">
      <div class="progress-bar" :class="{ complete: percentage >= 100 }" :style="{ width: percentage + '%' }">
        <span class="progress-text">{{ goal.current }} / {{ goal.total }}</span>
      </div>
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
        target: this.data?.target || 'New Goal'
      }
    }
  },
  watch: {
    data: {
      handler(value) {
        this.goal = {
          current: Number(value?.current ?? 0),
          total: Number(value?.total ?? 10),
          target: value?.target || 'New Goal'
        }
      },
      deep: true
    },
    goal: {
      handler(value) {
        this.$emit('update:data', value)
      },
      deep: true
    }
  },
  computed: {
    percentage() {
      if (!this.goal?.total) return 0
      return Math.min((this.goal.current / this.goal.total) * 100, 100)
    }
  }
}
</script>

<style scoped>
.widget-card {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e2db;
  width: 100%;
  max-width: 350px;
  box-shadow: none;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #37352f;
}

.percentage {
  font-size: 13px;
  font-weight: 600;
  color: #5d5951;
}

.target {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #555555;
}

.inputs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.goal-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
}

.progress-wrapper {
  background-color: #f0efeb;
  border-radius: 30px;
  height: 24px;
  overflow: hidden;
}

.progress-bar {
  background-color: #37352f;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.4s ease;
  border-radius: 30px;
}

.progress-bar.complete {
  background-color: #4f4a42;
}

.progress-text {
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
}
</style>
