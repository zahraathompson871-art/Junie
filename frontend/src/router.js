import { createRouter, createWebHashHistory } from 'vue-router'

// Views
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import SignUp from './views/SignUp.vue'
import Marketplace from './views/Marketplace.vue'
import Dashboard from './views/Dashboard.vue'
import Profile from './views/Profile.vue'
import CreatorHub from './views/CreatorHub.vue'
import CreateAccount from './views/CreateAccount.vue'
import Cart from './views/Cart.vue'
import Checkout from './views/Checkout.vue'
import ThankYou from './views/ThankYou.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/create-account', name: 'CreateAccount', component: CreateAccount },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace },
  { path: '/creatorhub', name: 'CreatorHub', component: CreatorHub },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/checkout', name: 'Checkout', component: Checkout },
  { path: '/thankyou', name: 'ThankYou', component: ThankYou } 
]

const router = createRouter({
  history: createWebHashHistory(), // ✅ switched to hash history
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const isAuthenticated = !!user

  const protectedRoutes = [
    'Dashboard', 'Marketplace', 'CreatorHub', 'Profile', 'Cart', 'Checkout', 'ThankYou'
  ]

  console.log('Navigation:', from.name, '→', to.name, 'User:', user) // ✅ debug log

  if (protectedRoutes.includes(to.name) && !isAuthenticated) {
    return next({ name: 'Login' })
  }

  if (isAuthenticated && !user.isProfileComplete && to.name !== 'CreateAccount') {
    return next({ name: 'CreateAccount' })
  }

  next()
})

export default router

