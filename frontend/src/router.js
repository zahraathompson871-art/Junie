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
import Checkout from './views/Checkout.vue'
import ThankYou from './views/ThankYou.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace },
  { path: '/creatorhub', name: 'CreatorHub', component: CreatorHub },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/checkout', name: 'Checkout', component: Checkout },
  { path: '/thankyou', name: 'ThankYou', component: ThankYou } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user')

  const protectedRoutes = [
    'Dashboard', 'Marketplace', 'CreatorHub', 'Profile', 'Cart', 'Checkout', 'ThankYou'
  ]

  if (protectedRoutes.includes(to.name) && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
