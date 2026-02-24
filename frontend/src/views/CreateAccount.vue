<template>
  <div class="create-account container mt-5">
    <div class="account-card p-4 mx-auto">
      <h2 class="text-glow mb-3 text-center">Create Your Account</h2>
      <p class="subtitle text-center mb-4">
        Complete your profile to unlock your dashboard.
      </p>

      <input class="form-control themed-input mb-3" v-model="name" placeholder="Full Name">
      <input class="form-control themed-input mb-3" v-model="email" placeholder="Email">
      <textarea class="form-control themed-input mb-3" v-model="bio" placeholder="Short Bio"></textarea>

      <div class="mb-3 text-center">
        <label class="form-label">Upload Profile Picture</label>
        <input type="file" class="form-control themed-input" @change="uploadAvatar">
        <div v-if="avatar" class="preview mt-3">
          <img :src="avatar" alt="Avatar preview" class="avatar-preview rounded-circle">
        </div>
      </div>

      <button class="btn btn-glow w-100" @click="saveAccount">Create Account</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      bio: '',
      avatar: ''
    }
  },
  mounted() {
    // Auto-fill with existing user data if available
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.name = user.name || ''
      this.email = user.email || ''
      this.bio = user.bio || ''
      this.avatar = user.avatar || ''
    }
  },
  methods: {
    uploadAvatar(e) {
      const file = e.target.files[0]
      if (file) {
        this.avatar = URL.createObjectURL(file)
      }
    },
    saveAccount() {
      let user = JSON.parse(localStorage.getItem('user')) || {}
      user.name = this.name
      user.email = this.email
      user.bio = this.bio
      user.avatar = this.avatar
      user.isProfileComplete = true // ✅ mark profile as complete

      localStorage.setItem('user', JSON.stringify(user))

      alert("Profile completed successfully!")
      this.$router.push({ name: 'Dashboard' })
    }
  }
}
</script>


<style scoped>
.create-account {
  max-width: 600px;
}

.account-card {
  background: #ffffff;
  border-radius: 16px;
  color: #333;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.text-glow {
  color: black;
  text-shadow: 0 0 8px rgb(72, 72, 70);
}

.subtitle {
  color: #3b3939;
}

.themed-input {
  background: #f9f9f9;
  border: 1px solid #ddd;
  color: #333;
}
.themed-input::placeholder {
  color: #1f1c1c;
}

.btn-glow {
  background: linear-gradient(black);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px;
  transition: transform 0.2s ease;
}
.btn-glow:hover {
  transform: scale(1.05);
}

.avatar-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 3px solid #27252a;
}
</style>
