<template>
  <div class="create-account container mt-5">
    <div class="account-card p-4 mx-auto">
      <h2 class="text-glow mb-3 text-center">Create Your Account</h2>
      <p class="subtitle text-center mb-4">
        Complete your profile to unlock your dashboard.
      </p>

      <p v-if="error" class="text-danger text-center">{{ error }}</p>

      <input class="form-control themed-input mb-3" v-model="name" placeholder="Full Name" />
      <input class="form-control themed-input mb-3" v-model="email" placeholder="Email" disabled />
      <textarea class="form-control themed-input mb-3" v-model="bio" placeholder="Short Bio"></textarea>

      <div class="mb-3 text-center">
        <label class="form-label">Upload Profile Picture</label>
        <input type="file" class="form-control themed-input" @change="uploadAvatar" />
        <div v-if="avatar" class="preview mt-3">
          <img :src="avatar" alt="Avatar preview" class="avatar-preview rounded-circle" />
        </div>
      </div>

      <button class="btn btn-glow w-100" @click="saveAccount">Save Account</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      email: "",
      bio: "",
      avatar: "",
      error: ""
    }
  },
  async mounted() {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`${this.getApiBaseUrl()}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) return

      this.name = data.full_name || ""
      this.email = data.email || ""
      this.avatar = data.avatar || ""
      const extras = JSON.parse(localStorage.getItem("profileExtras") || "{}")
      this.bio = extras.bio || ""
    } catch {
      this.error = "Failed to load profile details."
    }
  },
  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
    },
    uploadAvatar(e) {
      const file = e.target.files?.[0]
      if (!file) return
      this.avatar = URL.createObjectURL(file)
    },
    async saveAccount() {
      const token = localStorage.getItem("token")
      if (!token) {
        this.error = "Please log in first."
        return
      }
      try {
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: this.name,
            avatar: this.avatar
          })
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.error || data.message || "Failed to save account")
        }
        localStorage.setItem("profileExtras", JSON.stringify({ bio: this.bio }))
        this.$router.push({ name: "Dashboard" })
      } catch (err) {
        this.error = err.message || "Failed to save account."
      }
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
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.text-glow {
  color: #111;
}

.subtitle {
  color: #3b3939;
}

.themed-input {
  background: #f9f9f9;
  border: 1px solid #ddd;
  color: #333;
}

.btn-glow {
  background: #121212;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 3px solid #27252a;
}
</style>
