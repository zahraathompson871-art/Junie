<template>
  <div class="main">
    <div class="container mt-4" v-if="user">
      <h2 class="text-glow mb-4">My Dashboard</h2>

      <!-- Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-4 stat-block">
          <h6>Total Views</h6>
          <h3 class="text-glow">{{ user.stats.views }}</h3>
          <p class="text-muted">This month</p>
        </div>
        <div class="col-md-4 stat-block">
          <h6>Engagement</h6>
          <h3 class="text-glow">{{ user.stats.engagement }}</h3>
          <p class="text-muted">Active users</p>
        </div>
        <div class="col-md-4 stat-block">
          <h6>Sales</h6>
          <h3 class="text-glow">{{ user.stats.sales }}</h3>
          <p class="text-muted">Templates sold</p>
        </div>
      </div>

      <!-- Graphs -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 graph-block">
          <ApexGraph 
            title="Sales Trend" 
            type="bar" 
            :data="[10,20,15,30,25,40,35,20,15,25,30,20]" 
            :categories="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"/>
        </div>
        <div class="col-md-6 graph-block">
          <EChartGraph 
            title="Engagement Trend" 
            :data="[10,12,15,25,25,30,35,10,15,25,16,20]" 
            :categories="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"/>
        </div>
      </div>

      <!-- Progress Trackers -->
      <div class="row g-4 mb-4">
        <div class="col-md-4 progress-block">
          <h6>Downloads</h6>
          <div class="progress">
            <div class="progress-bar bg-purple" style="width:70%">70%</div>
          </div>
        </div>
        <div class="col-md-4 progress-block">
          <h6>Mental Fitness</h6>
          <div class="progress">
            <div class="progress-bar bg-purple" style="width:50%">50%</div>
          </div>
        </div>
        <div class="col-md-4 progress-block">
          <h6>Challenges Completed</h6>
          <div class="progress">
            <div class="progress-bar bg-purple" style="width:30%">30%</div>
          </div>
        </div>
      </div>

      <!-- Motivation + Challenges -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 motivation-block">
          <h5>Motivation</h5>
          <p>{{ user.motivation[0].text }}</p>
          <small class="text-muted">Stay consistent 🔥</small>
        </div>
        <div class="col-md-6 challenge-block">
          <h5>{{ user.challenges[0].title }}</h5>
          <p class="text-muted">Participants: {{ user.challenges[0].participants }}</p>
          <div class="progress mt-2">
            <div class="progress-bar bg-purple" :style="{width: user.challenges[0].progress}">
              {{ user.challenges[0].progress }}
            </div>
          </div>
          <button class="btn btn-glow mt-3">Join Challenge</button>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-6 challenge-block">
          <h5>{{ user.challenges[1].title }}</h5>
          <p class="text-muted">Participants: {{ user.challenges[1].participants }}</p>
          <div class="progress mt-2">
            <div class="progress-bar bg-purple" :style="{width: user.challenges[1].progress}">
              {{ user.challenges[1].progress }}
            </div>
          </div>
          <button class="btn btn-glow mt-3">Join Challenge</button>
        </div>
        <div class="col-md-6 motivation-block">
          <h5>Motivation</h5>
          <p>{{ user.motivation[1].text }}</p>
          <small class="text-muted">Stay consistent 🔥</small>
        </div>
      </div>

      <!-- Notifications + Community -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 notification-block">
          <h6>Notifications</h6>
          <ul>
            <li v-for="n in user.notifications" :key="n">{{ n }}</li>
          </ul>
        </div>
        <div class="col-md-6 community-block">
          <h6>Community Updates</h6>
          <ul>
            <li v-for="post in user.community" :key="post.id">
              <strong>{{ post.user }}:</strong> {{ post.text }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Task Manager (replaces Calendar) -->
      <div class="task-block p-3 mt-4">
        <h6>Tasks</h6>
        <ul class="task-list">
          <li v-for="(task, index) in tasks" :key="index">
            <input type="checkbox" v-model="task.done">
            <span :class="{completed: task.done}">{{ task.text }}</span>
          </li>
        </ul>
      </div>

      <!-- Goals -->
      <div class="goal-block p-3 mt-4">
        <h6>Goals</h6>
        <p>{{ user.goals.target }}</p>
        <div class="progress">
          <div class="progress-bar bg-purple" 
               :style="{width:(user.goals.current/user.goals.total*100)+'%'}">
            {{ user.goals.current }}/{{ user.goals.total }}
          </div>
        </div>
      </div>

    </div>
  </div>

</template>

<script>
import ApexGraph from '../components/ApexGraph.vue'
import EChartGraph from '../components/EChartGraph.vue'

export default { 
  components: { ApexGraph, EChartGraph },
  data() {
    return { 
      user:null,
      tasks: [
        { text: "Finish new template design", done: false },
        { text: "Upload product images", done: false },
        { text: "Respond to collab requests", done: false }
      ]
    }
  },

  async mounted(){
    const token = localStorage.getItem('token')

    try{
      const response = await fetch('http://localhost:500/api/users/me',{
        headers: {Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if(response.ok){
        this.user = data
      }else{
        console.log(data.error)
        this.$router.push({name: 'Login'})
      }

    }catch(err){
      console.log("Error loading dashboard")
    }
  }
}
</script>

<style scoped>
.main {
  flex: 1;
  overflow-y: auto;
  background-color: #fdfdf6; /* cream background */
  color: #121212;            /* black text */
}

.text-glow {
  color: #121212;
  font-weight: 600;
}

.stat-block, .progress-block, .motivation-block, .challenge-block,
.notification-block, .community-block, .task-block, .goal-block, .graph-block {
  background-color: #ffffff; /* white cards */
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Task list */
.task-list {
  list-style: none;
  padding-left: 0;
}
.task-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.completed {
  text-decoration: line-through;
  color: #888;
}

/* Progress bars */
.progress {
  background-color: #f2f2f2; /* cream progress background */
  border-radius: 8px;
  overflow: hidden;
}
.progress-bar {
  height: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #121212; /* black bar */
  color: #fff;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-glow {
  background-color: #121212; /* black button */
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}
.btn-glow:hover {
  background-color: #333;
}
.btn-outline {
  border: 1px solid #121212;
  color: #121212;
  background: transparent;
}
.btn-outline:hover {
  background-color: #121212;
  color: #fff;
}
</style>
