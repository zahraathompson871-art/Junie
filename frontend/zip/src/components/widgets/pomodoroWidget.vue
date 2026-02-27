<template>
  <div class="widget-card">
    <div class="header">
      <h5 class="title">Pomodoro Timer</h5>
      <span class="status" :class="{ running: isRunning }">{{ isRunning ? 'Running' : 'Paused' }}</span>
    </div>

    <div class="timer-display">{{ minutes }}:{{ seconds }}</div>

    <div class="progress-wrapper">
      <div class="progress-bar" :style="{ width: progress + '%' }" :class="{ finished: time === 0 }"></div>
    </div>

    <div class="button-group">
      <button class="btn start" @click="start" :disabled="isRunning || time === 0">Start</button>
      <button class="btn pause" @click="pause" :disabled="!isRunning">Pause</button>
      <button class="btn reset" @click="reset">Reset</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:data'],
  data() {
    const initial = Number(this.data?.time ?? 1500)
    return {
      time: initial,
      initialTime: Number(this.data?.initialTime ?? 1500),
      interval: null
    }
  },
  computed: {
    minutes() {
      return Math.floor(this.time / 60)
    },
    seconds() {
      return (this.time % 60).toString().padStart(2, '0')
    },
    isRunning() {
      return this.interval !== null
    },
    progress() {
      if (!this.initialTime) return 0
      return ((this.initialTime - this.time) / this.initialTime) * 100
    }
  },
  watch: {
    time() {
      this.emitState()
    },
    initialTime() {
      this.emitState()
    },
    data: {
      handler(value) {
        if (typeof value?.time === 'number') this.time = value.time
        if (typeof value?.initialTime === 'number') this.initialTime = value.initialTime
      },
      deep: true
    }
  },
  methods: {
    emitState() {
      this.$emit('update:data', {
        time: this.time,
        initialTime: this.initialTime
      })
    },
    start() {
      if (this.interval || this.time === 0) return
      this.interval = setInterval(() => {
        if (this.time > 0) {
          this.time--
        } else {
          this.pause()
        }
      }, 1000)
    },
    pause() {
      clearInterval(this.interval)
      this.interval = null
    },
    reset() {
      this.pause()
      this.time = this.initialTime
    }
  },
  beforeUnmount() {
    this.pause()
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
  margin-bottom: 15px;
}

.title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #37352f;
}

.status {
  font-size: 12px;
  font-weight: 600;
  color: #8b857b;
}

.status.running {
  color: #5d5951;
}

.timer-display {
  font-size: 42px;
  font-weight: 600;
  color: #37352f;
  text-align: center;
  margin-bottom: 18px;
  letter-spacing: 2px;
}

.progress-wrapper {
  background-color: #f0efeb;
  border-radius: 20px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-bar {
  background-color: #37352f;
  height: 100%;
  transition: width 0.4s linear;
}

.progress-bar.finished {
  background-color: #5d5951;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #ddd8d0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #37352f;
  background: #fff;
}

.btn:disabled {
  background-color: #f0efeb;
  cursor: not-allowed;
  color: #9c968d;
}

.start,
.pause,
.reset {
  background-color: #f7f5f2;
}

.start:hover:not(:disabled),
.pause:hover:not(:disabled),
.reset:hover:not(:disabled) {
  background-color: #efede9;
}
</style>
