import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'productionDispatch',
      component: () => import('../views/production-dispatch-view.vue')
    },
    {
      path: '/dispatchCalendar',
      name: 'dispatchCalendar',
      component: () => import('../views/dispatch-calendar-view.vue')
    },
    {
      path: '/machineSummary',
      name: 'machineSummary',
      component: () => import('../views/machine-summary-view.vue')
    },
    {
      path: '/feed',
      name: 'feed',
      component: () => import('../views/feed-view.vue')
    },
    {
      path: '/layingOff',
      name: 'layingOff',
      component: () => import('../views/laying-off-view.vue')
    },
    {
      path: '/mixing',
      name: 'mixing',
      component: () => import('../views/mixing-view.vue')
    },
    {
      path: '/samplingOperation',
      name: 'samplingOperation',
      component: () => import('../views/sampling-operation-view.vue')
    },
    {
      path: '/sopView',
      name: 'sopView',
      component: () => import('../views/sop-view.vue')
    },
    {
      path: '/workRderInStation',
      name: 'workRderInStation',
      component: () => import('../views/work-rder-in-station-view.vue')
    },
    {
      path: '/workRderOutStation',
      name: 'workRderOutStation',
      component: () => import('../views/work-rder-out-station-view.vue')
    },
    {
      path: '/exceptionHandling',
      name: 'exceptionHandling',
      component: () => import('../views/exception-handling-view.vue')
    },
    {
      path: '/processMaintenance',
      name: 'processMaintenance',
      component: () => import('../views/process-maintenance-view.vue')
    },
    {
      path: '/processParameterTemplateMaintenance',
      name: 'processParameterTemplateMaintenance',
      component: () => import('../views/process-parameter-template-maintenance-view.vue')
    },
    {
      path: '/processRoute',
      name: 'processRoute',
      component: () => import('../views/process-route-view.vue')
    },
    {
      path: '/nonProductionReporting',
      name: 'nonProductionReporting',
      component: () => import('../views/non-production-reporting-view.vue')
    },
    {
      path: '/firing',
      name: 'firing',
      component: () => import('../views/firing-view.vue')
    },
    {
      path: '/materialMovement',
      name: 'materialMovement',
      component: () => import('../views/material-movement-view.vue')
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: () => import('../views/warehouse-view.vue')
    }
    /*{
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }*/
  ]
})

export default router
