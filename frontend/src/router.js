import { createRouter, createWebHistory } from 'vue-router'

// Views
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import SignUp from './views/SignUp.vue'
import Marketplace from './views/Marketplace.vue'
import Dashboard from './views/Dashboard.vue'
import Profile from './views/Profile.vue'
import CreatorHub from './views/CreatorHub.vue'
import Cart from './views/Cart.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace },
  { path: '/creatorhub', name: 'CreatorHub', component: CreatorHub },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/cart', name: 'Cart', component: Cart }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Route Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user') // stored when login/signup succeeds

  // Protect all main app sections
  const protectedRoutes = ['Dashboard', 'Marketplace', 'CreatorHub', 'Profile', 'Cart']

  if (protectedRoutes.includes(to.name) && !isAuthenticated) {
    next({ name: 'Login' }) // redirect to login if not authenticated
  } else {
    next()
  }
})

export default router
