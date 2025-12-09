/* global axios */
import ApiClient from 'dashboard/api/ApiClient';

class KanbanService extends ApiClient {
  constructor() {
    super('conversations', { accountScoped: true });
  }

  // Atualizar labels de uma conversa
  updateConversationLabels(conversationId, labelIds) {
    return axios.post(`${this.url}/${conversationId}/labels`, {
      labels: labelIds,
    });
  }

  // Atualizar status de uma conversa
  updateConversationStatus(conversationId, status) {
    return axios.patch(`${this.url}/${conversationId}`, {
      status,
    });
  }

  // Buscar conversas de um inbox específico
  getConversationsByInbox(inboxId, params = {}) {
    return axios.get(this.url, {
      params: {
        inbox_id: inboxId,
        ...params,
      },
    });
  }
}

export default new KanbanService();
