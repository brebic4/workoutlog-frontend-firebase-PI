import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import WorkoutsView from '../views/WorkoutsView.vue'
import AdminView from '../views/AdminView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/workouts' },
    { path: '/login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/workouts', component: WorkoutsView, meta: { requiresAuth: true } },
    { path: '/admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
  if (to.meta.requiresAdmin && !auth.isAdmin) return '/workouts'
  if (to.meta.guestOnly && auth.isLoggedIn) return '/workouts'
})

export default router
