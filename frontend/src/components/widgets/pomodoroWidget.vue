<template>
    <div class="widget-card">
        <h5>Pomodoro Timer</h5>
        <h3>{{ minutes }}:{{ seconds }}</h3>
        <button @click="start">Start</button>
    </div>
</template>

<script>
export default {
  data() {
    return {
      time: 1500,
      interval: null,
    }
  },
    computed: {
        minutes() {
        return Math.floor(this.time / 60)
        },
        seconds() {
        return (this.time % 60).toString().padStart(2, '0');
        }
    },
  methods: {
    start() {
      if (this.interval) return
      this.interval = setInterval(() => {
        if (this.time > 0) this.time --
      },1000)
    }
  }
}
</script>