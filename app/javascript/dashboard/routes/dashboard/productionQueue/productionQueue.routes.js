import ProductionQueueView from './ProductionQueueView.vue';
import { frontendURL } from 'dashboard/helper/URLHelper';

const productionQueueRoutes = [
  {
    path: frontendURL('accounts/:accountId/production-queue'),
    name: 'production_queue',
    component: ProductionQueueView,
    meta: {
      title: 'Fila de Produção',
      permissions: ['administrator', 'agent', 'custom_role'],
    },
  },
];

export default {
  routes: productionQueueRoutes,
};
