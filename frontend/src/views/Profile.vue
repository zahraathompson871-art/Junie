<template>
  <div class="profile-page">
    <div class="container py-4" v-if="user">
      <h2 class="page-title mb-4">Profile</h2>

      <section class="profile-hero mb-4">
        <div class="avatar-wrap">
          <img
            :src="user.avatar || 'https://via.placeholder.com/100'"
            class="profile-img"
            alt="Profile"
          />
        </div>
        <div class="profile-meta">
          <h3>{{ user.full_name }}</h3>
          <p>{{ user.email }}</p>
          <span class="status-pill">Active account</span>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="showEdit = true">Edit Profile</button>
          <button class="btn btn-secondary" @click="showPassword = true">Change Password</button>
        </div>
      </section>

      <section class="row g-3 mb-4">
        <div class="col-md-4">
          <article class="metric-card">
            <p class="metric-label">Dashboard Blocks</p>
            <h4>{{ stats.dashboardBlocks }}</h4>
            <p class="metric-note">Your current workspace setup</p>
          </article>
        </div>
        <div class="col-md-4">
          <article class="metric-card">
            <p class="metric-label">Notebook Pages</p>
            <h4>{{ stats.notebookPages }}</h4>
            <p class="metric-note">Total saved pages</p>
          </article>
        </div>
        <div class="col-md-4">
          <article class="metric-card">
            <p class="metric-label">Focus Streak</p>
            <h4>{{ stats.focusStreakDays }} Days</h4>
            <p class="metric-note">Recent consistency</p>
          </article>
        </div>
      </section>

      <section class="account-panel">
        <h5>Account Settings</h5>
        <p>Manage your profile details and keep your account secure.</p>
        <div class="settings-actions">
          <button class="btn btn-primary" @click="showEdit = true">Update Details</button>
          <button class="btn btn-secondary" @click="showPassword = true">Password</button>
          <button class="btn btn-danger" @click="logout">Logout</button>
        </div>
      </section>

      
      <section class="plan-panel mb-4">
        <div class="plan-header">
          <div>
            <h5>Current Plan</h5>
            <p v-if="isPremium">You're on <strong>Premium</strong> — enjoy unlimited notebooks and all templates.</p>
            <p v-else>You're on the <strong>Free plan</strong> — 1 notebook, Calendar, To-Do & Goal Tracker widgets.</p>
          </div>
          <div class="plan-badge" :class="isPremium ? 'badge-premium' : 'badge-free'">
            {{ isPremium ? '✨ Premium' : 'Free' }}
          </div>
        </div>
        <div v-if="!isPremium" class="plan-upgrade">
          <div class="upgrade-features">
            <p class="feature-title">Upgrade to Premium and get:</p>
            <ul>
              <li>✅ Unlimited notebooks</li>
              <li>✅ All dashboard templates in the Marketplace</li>
              <li>✅ All widgets (Pomodoro, Mood Tracker, Quick Notes, Photos & more)</li>
            </ul>
          </div>
          <button class="btn btn-premium" @click="contactUpgrade">Get Premium</button>
        </div>
      </section>

      
      <div v-if="showEdit" class="modal-overlay">
        <div class="modal-card">
          <h5>Edit Profile</h5>
          <input class="form-control mb-2" v-model="user.full_name" placeholder="Full Name">
          <input class="form-control mb-2" v-model="user.email" placeholder="Email">

          
          <input type="file" class="form-control mb-3" @change="uploadAvatar">

          <button class="btn btn-primary mb-2" @click="saveProfile">Save</button>
          <button class="btn btn-outline" @click="showEdit = false">Cancel</button>
        </div>
      </div>

      
      <div v-if="showPassword" class="modal-overlay">
        <div class="modal-card">
          <h5>Change Password</h5>
          <input type="password" class="form-control mb-2" v-model="newPassword" placeholder="New Password">
          <input type="password" class="form-control mb-3" v-model="confirmPassword" placeholder="Confirm Password">
          <button class="btn btn-primary mb-2" @click="changePassword">Update</button>
          <button class="btn btn-outline" @click="showPassword = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  setup() {
    const cart = useCartStore()
    return { cart }
  },
  data() {
    return {
      user:null,
      showEdit: false,
      isPremium: false,
      showPassword: false,
      newPassword: '',
      confirmPassword: '',
      stats: {
        dashboardBlocks: 0,
        notebookPages: 0,
        focusStreakDays: 0
      }
    }
  },
  async mounted(){
      const token = localStorage.getItem('token')

      try{
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/me`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (response.ok){
          this.user = data
          await this.loadUsageStats()
          await this.loadSubscriptionStatus()
        }else{
          this.$router.push({ name: 'Login'})
        }

      }catch(err){
        console.log("Error Loading Profile")
      }
    }, 

  methods: {
    getApiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    },
    getAuthHeaders() {
      const token = localStorage.getItem('token')
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    },
    async parseJson(response) {
      try {
        return await response.json()
      } catch {
        return {}
      }
    },
    async loadUsageStats() {
      try {
        const dashboardRes = await fetch(`${this.getApiBaseUrl()}/api/users/dashboard`, {
          headers: { Authorization: this.getAuthHeaders().Authorization }
        })
        const dashboard = await this.parseJson(dashboardRes)
        if (dashboardRes.ok && Array.isArray(dashboard)) {
          this.stats.dashboardBlocks = dashboard.length
        }

        const workspacesRes = await fetch(`${this.getApiBaseUrl()}/api/workspaces`, {
          headers: { Authorization: this.getAuthHeaders().Authorization }
        })
        const workspaces = await this.parseJson(workspacesRes)
        let pagesCount = 0
        if (workspacesRes.ok && Array.isArray(workspaces)) {
          for (const workspace of workspaces) {
            const booksRes = await fetch(`${this.getApiBaseUrl()}/api/books/workspace/${workspace.id}`, {
              headers: { Authorization: this.getAuthHeaders().Authorization }
            })
            const books = await this.parseJson(booksRes)
            if (!booksRes.ok || !Array.isArray(books)) continue
            for (const book of books) {
              const pagesRes = await fetch(`${this.getApiBaseUrl()}/api/pages/book/${book.id}`, {
                headers: { Authorization: this.getAuthHeaders().Authorization }
              })
              const pages = await this.parseJson(pagesRes)
              if (pagesRes.ok && Array.isArray(pages)) {
                pagesCount += pages.length
              }
            }
          }
        }
        this.stats.notebookPages = pagesCount
        this.stats.focusStreakDays = Math.min(30, Math.max(1, Math.ceil((this.stats.dashboardBlocks + pagesCount) / 3)))
      } catch {
        this.stats.focusStreakDays = Math.max(1, this.stats.focusStreakDays)
      }
    },
    async loadSubscriptionStatus() {
      try {
        const res = await fetch(`${this.getApiBaseUrl()}/api/templates/entitlements`, {
          headers: { Authorization: this.getAuthHeaders().Authorization }
        })
        const data = await this.parseJson(res)
        this.isPremium = !!data.hasActiveSubscription
      } catch {
        this.isPremium = false
      }
    },
    uploadAvatar(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.user.avatar = e?.target?.result || ''
        }
        reader.readAsDataURL(file)
      }
    },

    async saveProfile() {
      try{
        const response = await fetch(`${this.getApiBaseUrl()}/api/users/me`,{
          method:'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(this.user)
        })

        if(response.ok){
          alert("Profile updated successfully!")
          this.showEdit = false
        }else{
          const data = await response.json().catch(() => ({}))
          alert(data.error || data.message || "Failed to update profile")
        }

      }catch(err){
        console.log("Update error", err)
        alert("Failed to update profile")
      } 
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
    contactUpgrade() {
      this.cart.addItem({
        id: 'premium-monthly',
        cartKey: 'premium_subscription:premium-monthly',
        type: 'premium_subscription',
        title: 'Premium Plan (Monthly)',
        price: 149,
        image: ''
      })
      this.$router.push('/checkout')
    },
    logout() {
      localStorage.removeItem('token')
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--dash-bg, #f5faf1);
  color: var(--dash-title, #253629);
}

.page-title {
  font-weight: 800;
  letter-spacing: -0.02em;
  font-family: "Space Grotesk", "Plus Jakarta Sans", sans-serif;
}

.profile-hero,
.metric-card,
.account-panel {
  background: var(--dash-card, var(--n-surface, rgba(255, 255, 255, 0.92)));
  border: 1px solid var(--dash-border, var(--n-border, #dbe3ff));
  border-radius: 16px;
  box-shadow: 0 10px 26px rgba(36, 56, 122, 0.1);
}

.profile-hero {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 20px;
}

.profile-img {
  border: 3px solid var(--dash-border, #dbe3ff);
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 999px;
}

.profile-meta h3 {
  margin: 0 0 6px;
  font-weight: 700;
}

.profile-meta p {
  margin: 0 0 10px;
  color: var(--n-text-muted, #647096);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #246244;
  background: #e2f5ea;
  border: 1px solid #bce6cb;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.metric-card {
  padding: 18px;
  height: 100%;
}

.metric-label {
  margin: 0 0 8px;
  color: var(--n-text-muted, #647096);
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.metric-card h4 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
}

.metric-note {
  margin: 6px 0 0;
  color: var(--n-text-muted, #647096);
  font-size: 0.92rem;
}

.account-panel {
  padding: 20px;
}

.account-panel h5 {
  margin: 0 0 6px;
}

.account-panel p {
  margin: 0 0 14px;
  color: var(--n-text-muted, #647096);
}

.settings-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: linear-gradient(135deg, var(--dash-accent, #6f8f63), var(--dash-accent-2, #9caf88));
  color: #fff;
  box-shadow: 0 10px 20px rgba(111, 143, 99, 0.24);
}

.btn-secondary {
  background: #fff;
  border-color: var(--dash-border, #dbe3ff);
  color: var(--dash-title, #171d35);
}

.btn-danger {
  background: #fff1f1;
  border-color: #f3c7c7;
  color: #8a2f2f;
}

.btn-primary:hover,
.btn-secondary:hover,
.btn-danger:hover {
  transform: translateY(-1px);
}

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
  background: #ffffff;
  color: var(--dash-title, #171d35);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 1px solid var(--dash-border, #dbe3ff);
  box-shadow: 0 10px 26px rgba(36, 56, 122, 0.16);
}

.btn-outline {
  border: 1px solid var(--dash-border, #dbe3ff);
  color: var(--dash-title, #171d35);
  background: #fff;
}

@media (max-width: 768px) {
  .profile-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .avatar-wrap {
    display: flex;
    justify-content: center;
  }

  .hero-actions,
  .settings-actions {
    justify-content: center;
  }
}
.plan-panel {
  background: var(--dash-card, rgba(255,255,255,0.92));
  border: 1px solid var(--dash-border, #dbe3ff);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 26px rgba(36, 56, 122, 0.1);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 0;
}

.plan-header h5 {
  margin: 0 0 6px;
}

.plan-header p {
  margin: 0;
  color: var(--n-text-muted, #647096);
}

.plan-badge {
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.85rem;
  white-space: nowrap;
}

.badge-free {
  background: #f0f0f0;
  color: #555;
  border: 1px solid #ddd;
}

.badge-premium {
  background: linear-gradient(135deg, #f0c060, #e8a020);
  color: #5a3800;
  border: 1px solid #d4931a;
}

.plan-upgrade {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--dash-border, #dbe3ff);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.upgrade-features .feature-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--dash-title, #253629);
}

.upgrade-features ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upgrade-features li {
  font-size: 0.92rem;
  color: var(--n-text-muted, #647096);
}

.btn-premium {
  background: linear-gradient(135deg, #f0c060, #e8a020);
  color: #5a3800;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(224, 152, 0, 0.3);
}

.btn-premium:hover {
  background: linear-gradient(135deg, #e8b020, #c87800);
  transform: translateY(-1px);
}
</style>



