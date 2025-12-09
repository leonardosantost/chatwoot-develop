import KanbanView from './KanbanView.vue';
import { frontendURL } from 'dashboard/helper/URLHelper';

const kanbanRoutes = [
  {
    path: frontendURL('accounts/:accountId/kanban'),
    name: 'kanban_view',
    component: KanbanView,
    meta: {
      title: 'Funil de Vendas',
      permissions: ['administrator', 'agent', 'custom_role'],
    },
  },
];

export default {
  routes: kanbanRoutes,
};
