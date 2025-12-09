import ApiClient from './ApiClient';

const ApiEndpoint = 'conversations';

export default {
  // Atualizar labels de uma conversa
  updateConversationLabels(conversationId, labelIds) {
    return ApiClient.patch(
      `${ApiEndpoint}/${conversationId}/labels`,
      {
        labels: labelIds,
      }
    );
  },

  // Atualizar status de uma conversa
  updateConversationStatus(conversationId, status) {
    return ApiClient.patch(`${ApiEndpoint}/${conversationId}`, {
      status: status,
    });
  },

  // Buscar conversas de um inbox específico
  getConversationsByInbox(inboxId, params = {}) {
    return ApiClient.get(`${ApiEndpoint}`, {
      params: {
        inbox_id: inboxId,
        ...params,
      },
    });
  },
};
