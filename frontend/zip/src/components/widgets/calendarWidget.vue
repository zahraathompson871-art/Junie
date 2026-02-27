<template>
  <div class="calendar-widget">
    
    <div class="calendar-header">
      <button @click="prevMonth">‹</button>
      <h5>{{ monthName }} {{ currentYear }}</h5>
      <button @click="nextMonth">›</button>
    </div>

    
    <div class="calendar-weekdays">
      <span v-for="day in weekdays" :key="day">{{ day }}</span>
    </div>

    
    <div class="calendar-days">
      <span
        v-for="(day, index) in daysInMonth"
        :key="index"
        :class="{'today': isToday(day)}"
      >
        {{ day }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalendarWidget",
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:data"],
  data() {
    const today = new Date();
    return {
      currentMonth: Number(this.data?.currentMonth ?? today.getMonth()),
      currentYear: Number(this.data?.currentYear ?? today.getFullYear()),
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    };
  },
  watch: {
    data: {
      handler(value) {
        const today = new Date();
        this.currentMonth = Number(value?.currentMonth ?? today.getMonth());
        this.currentYear = Number(value?.currentYear ?? today.getFullYear());
      },
      deep: true
    },
    currentMonth() {
      this.emitState();
    },
    currentYear() {
      this.emitState();
    }
  },
  computed: {
    monthName() {
      return new Date(this.currentYear, this.currentMonth).toLocaleString("default", { month: "long" });
    },
    daysInMonth() {
      const days = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      return Array.from({ length: days }, (_, i) => i + 1);
    }
  },
  methods: {
    emitState() {
      this.$emit("update:data", {
        currentMonth: this.currentMonth,
        currentYear: this.currentYear
      });
    },
    isToday(day) {
      const today = new Date();
      return (
        day === today.getDate() &&
        this.currentMonth === today.getMonth() &&
        this.currentYear === today.getFullYear()
      );
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    }
  }
};
</script>
<style scoped>
.calendar-widget {
  position: relative;
  background: url('https://i.pinimg.com/1200x/99/8f/26/998f262dacbef65ed355a6a00174e10e.jpg') no-repeat center center;
  background-size: cover;         
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #000;
  overflow: hidden;
}

.calendar-widget::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7); 
  border-radius: 12px;
}

.calendar-widget > * {
  position: relative;
  z-index: 1;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.calendar-header h5 {
  margin: 0;
  font-size: 1.2rem;
  color: #000;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #000;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-days span {
  padding: 8px;
  border-radius: 6px;
  background: #fdfdfd;
  color: #000;
}

.calendar-days span.today {
  background: #000;
  color: #fff;
  font-weight: bold;
}
</style>


