<template>
    <div class="widget-card">
        <div class="header">
            <h5 class="title">Pomodoro Timer</h5>
            <span 
                class="status"
                :class="{ running: isRunning }"
            >
                {{ isRunning ? "Running" : "Paused" }}
            </span>
        </div>

        <div class="timer-display">
            {{ minutes }}:{{ seconds }}
        </div>

        <div class="progress-wrapper">
            <div 
                class="progress-bar"
                :style="{ width: progress + '%' }"
                :class="{ finished: time === 0 }"
            ></div>
        </div>

        <div class="button-group">
            <button 
                class="btn start"
                @click="start"
                :disabled="isRunning || time === 0"
            >
                Start
            </button>

            <button 
                class="btn pause"
                @click="pause"
                :disabled="!isRunning"
            >
                Pause
            </button>

            <button 
                class="btn reset"
                @click="reset"
            >
                Reset
            </button>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      time: 1500,
      initialTime: 1500,
      interval: null,
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
      return ((this.initialTime - this.time) / this.initialTime) * 100
    }
  },
  methods: {
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
    border: 1px solid #e5e5e5;
    width: 100%;
    max-width: 350px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
    font-family: Arial, sans-serif;
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
    color: #222222;
}

.status {
    font-size: 12px;
    font-weight: 600;
    color: #999999;
}

.status.running {
    color: #2ecc71;
}

.timer-display {
    font-size: 42px;
    font-weight: 600;
    color: #222222;
    text-align: center;
    margin-bottom: 18px;
    letter-spacing: 2px;
}

.progress-wrapper {
    background-color: #f0f0f0;
    border-radius: 20px;
    height: 8px;
    overflow: hidden;
    margin-bottom: 20px;
}

.progress-bar {
    background-color: #4a90e2;
    height: 100%;
    transition: width 0.4s linear;
}

.progress-bar.finished {
    background-color: #d0021b;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.btn {
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    color: #666666;
}

.start {
    background-color: #4a90e2;
    color: #ffffff;
}

.start:hover:not(:disabled) {
    background-color: #3d7cc4;
}

.pause {
    background-color: #f5a623;
    color: #ffffff;
}

.pause:hover:not(:disabled) {
    background-color: #d4881f;
}

.reset {
    background-color: #555555;
    color: #ffffff;
}

.reset:hover {
    background-color: #333333;
}
</style>