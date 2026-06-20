import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuestionView from '../views/QuestionView.vue'
import ResultView from '../views/ResultView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import ManageView from '../views/ManageView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/question', component: QuestionView },
  { path: '/result', component: ResultView },
  { path: '/analysis', component: AnalysisView },
  { path: '/manage', component: ManageView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
