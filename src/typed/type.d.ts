declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/**
 * @deprecated
 */
declare module 'layouts-generated' {
  import type { RouteRecordRaw } from 'vue-router'

  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

declare module 'virtual:generated-layouts' {
  import type { RouteRecordRaw } from 'vue-router'

  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

declare module '~pages' {
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

declare module 'pages-generated' {
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

declare module 'virtual:generated-pages' {
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}
declare module 'uuid';
declare module 'qs';
declare module 'v-code-diff';
declare module '@antv/g2';
declare module 'vue3-print-nb';
