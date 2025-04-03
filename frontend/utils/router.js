import HomePage from "../pages/HomePage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
import UserDashboardPage from "../pages/UserDashboardPage.js";
import quiz from "../pages/quiz.js";
import quiz_results from "../pages/quiz_results.js";
import user from "../pages/user.js";
import admin_summary from "../pages/admin_summary.js";


const routes = [
  { path: "/", component: HomePage },
  { path: "/login", component: LoginPage, name: 'LoginPage' },
  { path: "/register", component: RegisterPage },
  {
    path: "/admin/dashboard",
    component: AdminDashboardPage
  },
  {
    path: '/user/admin',
    component: user,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      if (!localStorage.getItem('user')) {
        next({ name: 'LoginPage' });
        return;
      }
      next();
    }
  },
  {
    path: '/admin/summary',
    component: admin_summary
  },
  {
    path: "/user/dashboard",
    component: UserDashboardPage,
    name: 'UserDashboardPage'
  },
  {
    path: '/quiz/:quizId',
    name: 'quiz',
    component: quiz,
    props: true,
    beforeEnter: (to, from, next) => {
      const timerState = localStorage.getItem('currentQuizTimer');
      if (!timerState) {
        next({ name: 'UserDashboardPage' });
        return;
      }
      const timer = JSON.parse(timerState);
      if (timer.quizId.toString() !== to.params.quizId) {
        next({ name: 'UserDashboardPage' });
        return;
      }
      next();
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz_results/:quizId',
    name: 'quiz_results',
    component: quiz_results,
    meta: { requiresAuth: true }
  }
];

const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});

export default router;