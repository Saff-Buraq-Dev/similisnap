import { createWebHistory, createRouter } from "vue-router";
import { auth } from "../firebase";

import LandingPage from "../pages/LandingPage.vue";
import MaintenancePage from "../pages/MaintenancePage.vue";
import LoginPage from "../pages/Authentication/LoginPage.vue";
import RegisterPage from "../pages/Authentication/RegisterPage.vue";
import GalleryPage from "../pages/GalleryPage.vue";
import AccountPage from "../pages/Settings/AccountSettingsPage.vue";

import VerificationNeeded from "../components/Authentication/EmailConfirmation/VerificationNeeded.vue";



const routes = [
  { path: "/", name: "LandingPage", component: LandingPage },
  { path: "/maintenance", name: "MaintenancePage", component: MaintenancePage },
  { path: "/login", name: "LoginPage", component: LoginPage },
  { path: "/register", name: "RegisterPage", component: RegisterPage },

  /** Needs Auth */
  { path: "/gallery", name: "GalleryPage", component: GalleryPage, meta: { requiresAuth: true } },
  { path: "/account", name: "AccountPage", component: AccountPage, meta: { requiresAuth: true } },

  { path: "/verification", name: "VerificationNeeded", component: VerificationNeeded }
];


const router = createRouter({
  history: createWebHistory(),
  linkExactActiveClass: "active",
  routes: routes,
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
});


router.beforeEach((to, from, next) => {
  setTimeout(() => {
    console.log('ROUTER: ', to.path);
    console.log('ROUTER: ', auth.currentUser);

    if ((to.path === '/login' || to.path === '/register') && auth.currentUser != null) {
      console.log('tatataaaa')
      next('/');
      return;
    }
    if (to.matched.some(record => record.meta.requiresAuth) && !auth.currentUser) {
      console.log('totoooo')
      next('/login');
      return;
    }
    next();
  }, 500);

});

export default router;