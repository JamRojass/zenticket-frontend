import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import HomeView from '@/views/HomeView.vue';
import RegisterCompanyView from '@/views/RegisterCompanyView.vue';
import LoginView from '@/views/LoginView.vue';
import KioskView from '@/views/KioskView.vue';
import DisplayView from '@/views/DisplayView.vue';
import OperatorView from '@/views/OperatorView.vue';
import AdminView from '@/views/AdminView.vue';

// Define application routes with metadata for access control
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'RegisterCompany',
    component: RegisterCompanyView,
    meta: { guestOnly: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/kiosk/:code',
    name: 'Kiosk',
    component: KioskView,
    meta: { public: true },
  },
  {
    path: '/display/:code',
    name: 'Display',
    component: DisplayView,
    meta: { public: true },
  },
  {
    path: '/operator',
    name: 'Operator',
    component: OperatorView,
    meta: { requiresAuth: true, allowedRoles: ['operator', 'admin'] },
  },
  {
    path: '/admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/areas',
    children: [
      { path: 'areas', component: () => import('../views/admin/AreasView.vue') },
      { path: 'staff', component: () => import('../views/admin/StaffView.vue') },
      { path: 'stations', component: () => import('../views/admin/StationsView.vue') },
      { path: 'tickets', component: () => import('../views/admin/TicketsView.vue') },
      { path: 'displays', component: () => import('../views/admin/DisplaysView.vue') },
      { path: 'audit', component: () => import('../views/admin/AuditView.vue') },
      { path: 'settings', component: () => import('../views/admin/SettingView.vue') }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

// Initialize Vue Router with HTML5 history mode
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard for authentication and role-based redirection
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Redirect authenticated users away from guest-only pages (like login/register)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (authStore.userRole === 'admin') {
      return next('/admin');
    }
    return next('/operator');
  }
  
  // Protect private routes requiring authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/login');
    }
    // Verify role permissions if specified in route meta
    if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(authStore.userRole)) {
      return next('/operator');
    }
  }
  next();
});

export default router;