import { createRouter, createWebHistory } from "vue-router"

import Dashboard from "./pages/Dashboard.vue"
import Marketplace from "./pages/Marketplace.vue"
import Challenges from "./pages/Challenges.vue"
import CreatorHub from "./pages/CreatorHub.vue"
import Profile from "./pages/Profile.vue"

export default createRouter({
 history: createWebHistory(),
 routes: [
  { path: "/", component: Dashboard },
  { path: "/marketplace", component: Marketplace },
  { path: "/challenges", component: Challenges },
  { path: "/creator", component: CreatorHub },
  { path: "/profile", component: Profile }
 ]
})
