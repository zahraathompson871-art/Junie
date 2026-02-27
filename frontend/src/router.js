import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import SignUp from './views/SignUp.vue'
import Marketplace from './views/Marketplace.vue'
import Dashboard from './views/Dashboard.vue'
import Profile from './views/Profile.vue'
import CreateAccount from './views/CreateAccount.vue'
import Checkout from './views/Checkout.vue'
import ThankYou from './views/ThankYou.vue'
import Notebooks from './views/Notebooks.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/create-account', name: 'CreateAccount', component: CreateAccount },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/cart', redirect: '/checkout' },
  { path: '/checkout', name: 'Checkout', component: Checkout },
  { path: '/thankyou', name: 'ThankYou', component: ThankYou }
  ,{ path: '/notebooks', name: 'Notebooks', component: Notebooks }
  ,{ path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  const protectedRoutes = [
    'Dashboard', 'Marketplace', 'Profile', 'Checkout', 'ThankYou', 'Notebooks'
  ]

  if (protectedRoutes.includes(to.name) && !token) {
    return next({ name: 'Login' })
  }

  return next()
})

export default router

