import ProductionQueueView from './ProductionQueueView.vue';
import { frontendURL } from 'dashboard/helper/URLHelper';

const productionQueueRoutes = [
  {
    path: frontendURL('accounts/:accountId/production-queue'),
    name: 'production_queue',
    component: ProductionQueueView,
    meta: {
      title: 'Production Queue',
      permissions: ['administrator', 'agent', 'custom_role'],
    },
  },
];

export default {
  routes: productionQueueRoutes,
};
