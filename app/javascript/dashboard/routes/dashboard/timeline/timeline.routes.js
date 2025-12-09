import TimelineView from './TimelineView.vue';
import { frontendURL } from 'dashboard/helper/URLHelper';

const timelineRoutes = [
  {
    path: frontendURL('accounts/:accountId/timeline'),
    name: 'timeline_view',
    component: TimelineView,
    meta: {
      title: 'Linha do Tempo',
      permissions: ['administrator', 'agent', 'custom_role'],
    },
  },
];

export default {
  routes: timelineRoutes,
};
