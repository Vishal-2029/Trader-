// src/router/index.js
import { createWebHistory, createRouter } from "vue-router";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import Userchart from "./components/Userchart.vue";

const routes = [
  {
    name: "Login",
    path: "/",
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    name: "Userchart",
    path: "/Userchart/:user_id",
    component: Userchart,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "Login" });
  }

  
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: "Dashboard" });
  }

  next();
});

export default router;
