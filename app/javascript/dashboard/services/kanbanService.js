/* global axios */
import ApiClient from 'dashboard/api/ApiClient';

class KanbanService extends ApiClient {
  constructor() {
    super('conversations', { accountScoped: true });
  }

  fetchLabels() {
    const labelsClient = new ApiClient('labels', { accountScoped: true });
    return axios.get(labelsClient.url);
  }

  // Atualizar labels de uma conversa usando títulos das labels
  updateConversationLabels(conversationId, labels) {
    return axios.post(`${this.url}/${conversationId}/labels`, {
      labels,
    });
  }

  // Atualizar status de uma conversa
  updateConversationStatus(conversationId, status) {
    return axios.patch(`${this.url}/${conversationId}`, {
      status,
    });
  }

  // Buscar conversas com filtros arbitrários
  getConversations(params = {}) {
    return axios.get(this.url, {
      params,
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
