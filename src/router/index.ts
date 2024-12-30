import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import HomePage from '../views/HomePage.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// check autentification before routting
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authToken'); // get if your are connected
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // swich to login page
  } else {
    next();
  }
});

export default router;
