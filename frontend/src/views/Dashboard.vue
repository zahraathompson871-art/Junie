<template>
  <div class="main">
    <div class="container mt-4">

      <div class="header-section mb-4">
        <img src="https://i.pinimg.com/1200x/61/29/b9/6129b9783e7a0973c03ffa37d9bc5f17.jpg" 
             alt="Header Image" class="header-image"/>
        <h2 class="dashboard-title">My Dashboard</h2>
        <p class="dashboard-quote">
          It all begins with your mind. What you give power to has power over you.
        </p>
      </div>

      <div class="row">
        <div class="col-md-3">
          <ToDoWidget :data="[{ text: 'Finish AI assignment', done: false }, { text: 'Study 2 hours', done: false }]"/>
          <CalendarWidget />
        </div>


        <div class="col-md-6 text-center">
          <PictureWidget :data="{ src: 'https://i.pinimg.com/736x/b3/8d/cc/b38dcc01877a6cce3e55216552652f18.jpg' }"/>
        </div>


        <div class="col-md-3">
          <GoalWidget :data="{ current: 3, total: 10, target: 'Complete 10 study sessions' }"/>
          <PomodoroWidget />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ToDoWidget from '../components/widgets/toDoWidget.vue';
import GoalWidget from '../components/widgets/goalWidget.vue';
import PomodoroWidget from '../components/widgets/pomodoroWidget.vue';
import CalendarWidget from '../components/widgets/calendarWidget.vue';
import PictureWidget from '../components/widgets/pictureWidget.vue';

export default {
  components: {
    ToDoWidget,
    GoalWidget,
    PomodoroWidget,
    CalendarWidget,
    PictureWidget
  }
}
</script>

<style scoped>
.main {
  background-color: #fdfdf6;
  color: #121212;
  min-height: 100vh;
}

.header-section {
  text-align: center;
}

.header-image {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.dashboard-title {
  font-weight: 700;
  color: #121212;
}

.dashboard-quote {
  font-style: italic;
  color: #333;
}

.widget-card {
  background-color: #ffffff; 
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
