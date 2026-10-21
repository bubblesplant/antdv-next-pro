import { createRouter, createWebHashHistory } from 'vue-router'
import { defaultExamplePath, examples } from './examples'
import ExamplePage from './views/ExamplePage.vue'

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ExamplePage,
      props: (route) => ({ example: examples.find((example) => example.path === route.path)! }),
      children: [
        { path: '', redirect: defaultExamplePath },
        ...examples.map((example) => ({
          path: example.path,
          name: example.path.slice(1),
          component: example.loadComponent,
          meta: { title: example.title, componentId: example.componentId },
        })),
      ],
    },
    { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundPage.vue') },
  ],
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? `${to.meta.title} · ` : ''
  document.title = `${title}Antdv Next Pro Playground`
})
