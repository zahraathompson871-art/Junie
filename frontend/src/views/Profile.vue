<template>
  <div class="main">
    <div class="container mt-4">
      <h2 class="text-glow mb-4">Profile</h2>
      
      <!-- Profile Card -->
      <div class="profile-block text-center mb-4">
        <img :src="user.avatar || 'https://via.placeholder.com/100'" 
             class="rounded-circle mb-3 profile-img" alt="Profile">
        <h5>{{ user.name }}</h5>
        <p>Email: {{ user.email }}</p>
        <span class="badge bg-purple">Creator</span>
      </div>

      <!-- Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-4 progress-block">
          <h6>Products Sold</h6>
          <div class="progress">
            <div class="progress-bar bg-purple" style="width:60%">60%</div>
          </div>
        </div>
        <div class="col-md-4 progress-block">
          <h6>Challenges Joined</h6>
          <div class="progress">
            <div class="progress-bar bg-purple" style="width:40%">40%</div>
          </div>
        </div>
        <div class="col-md-4 progress-block">
          <h6>Followers</h6>
          <div class="progress">
            <div class="progress-bar bg-purple" style="width:80%">80%</div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="settings-block p-3">
        <h6>Settings</h6>
        <button class="btn btn-glow" @click="showEdit = true">Edit Profile</button>
        <button class="btn btn-glow" @click="showPassword = true">Change Password</button>
        <button class="btn btn-glow" @click="logout">Logout</button>
      </div>

      <!-- Edit Profile Modal -->
      <div v-if="showEdit" class="modal-overlay">
        <div class="modal-card">
          <h5>Edit Profile</h5>
          <input class="form-control mb-2" v-model="user.name" placeholder="Full Name">
          <input class="form-control mb-2" v-model="user.email" placeholder="Email">

          <!-- Profile Picture Upload -->
          <input type="file" class="form-control mb-3" @change="uploadAvatar">

          <button class="btn btn-glow mb-2" @click="saveProfile">Save</button>
          <button class="btn btn-outline" @click="showEdit = false">Cancel</button>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div v-if="showPassword" class="modal-overlay">
        <div class="modal-card">
          <h5>Change Password</h5>
          <input type="password" class="form-control mb-2" v-model="newPassword" placeholder="New Password">
          <input type="password" class="form-control mb-3" v-model="confirmPassword" placeholder="Confirm Password">
          <button class="btn btn-glow mb-2" @click="changePassword">Update</button>
          <button class="btn btn-outline" @click="showPassword = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mockUser from '../data/mockUser.js'

export default {
  data() {
    return {
      user: {
        ...mockUser,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.1.0"
      },
      showEdit: false,
      showPassword: false,
      newPassword: '',
      confirmPassword: ''
    }
  },
  methods: {
    uploadAvatar(event) {
      const file = event.target.files[0]
      if (file) {
        this.user.avatar = URL.createObjectURL(file)
      }
    },
    saveProfile() {
      localStorage.setItem('user', JSON.stringify(this.user))
      alert("Profile updated successfully!")
      this.showEdit = false
    },
    changePassword() {
      if (this.newPassword && this.newPassword === this.confirmPassword) {
        alert("Password updated successfully!")
        this.showPassword = false
        this.newPassword = ''
        this.confirmPassword = ''
      } else {
        alert("Passwords do not match.")
      }
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push({ name: 'Home' })
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

/* Profile, Progress, Settings blocks */
.profile-block, .progress-block, .settings-block {
  background-color: #ffffff; /* white cards */
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.profile-img {
  border: 3px solid #121212;
  width: 100px;
  height: 100px;
  object-fit: cover;
}

/* Badge */
.bg-purple {
  background-color: #121212; /* black badge */
  color: #fff;
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

/* Settings buttons */
.settings-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-card {
  background: #ffffff; /* white modal */
  color: #121212;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
