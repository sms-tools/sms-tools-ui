import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import HomePage from '../views/HomePage.vue';
import SmsPage from '@/views/SmsPage.vue';
import createContact from '@/views/createContact.vue';
import ContactPage from '@/views/ContactPage.vue';
import SendMasseSms from '@/views/SendMasseSms.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/sms', name: 'sms', component: SmsPage, meta: { requiresAuth: true } },
  { path: '/contact', name: 'contact', component: ContactPage, meta: { requiresAuth: true } },
  {
    path: '/manySms',
    name: 'many sms',
    component: SendMasseSms /*, meta: { requiresAuth: true }*/,
  },
  {
    path: '/createContact',
    name: 'createContact',
    component: createContact,
    meta: { requiresAuth: true },
  },
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
