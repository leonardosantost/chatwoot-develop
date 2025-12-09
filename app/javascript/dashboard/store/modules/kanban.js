import { API } from 'dashboard/api';
import kanbanService from 'dashboard/services/kanbanService';

const state = {
  // Mapa de conversas por label: { labelId: [conversations] }
  conversationsByLabel: {},
  // Todas as labels para o kanban
  kanbanLabels: [],
  // Conversas sem label
  untaggedConversations: [],
  // Estado de carregamento
  isLoading: false,
  // Erro
  error: null,
};

const getters = {
  getConversationsByLabel: state => labelId => {
    return state.conversationsByLabel[labelId] || [];
  },

  getKanbanLabels: state => state.kanbanLabels,

  getUntaggedConversations: state => state.untaggedConversations,

  isLoading: state => state.isLoading,

  getError: state => state.error,

  // Retorna todas as conversas organizadas por label
  getAllConversationsByLabel: state => state.conversationsByLabel,
};

const actions = {
  // Carregar labels do kanban e conversas associadas
  async loadKanbanData({ commit, dispatch }, filters = {}) {
    commit('setLoading', true);
    try {
      // Buscar todas as labels do Chatwoot
      const labelsResponse = await API.get('/labels');
      const labels = labelsResponse.data.payload || [];

      // Filtrar apenas labels que podem ser usadas no kanban
      const kanbanLabels = labels.filter(label => label.show_on_sidebar);

      commit('setKanbanLabels', kanbanLabels);

      // Carregar conversas para cada label
      for (const label of kanbanLabels) {
        await dispatch('loadConversationsByLabel', {
          labelId: label.id,
          labelTitle: label.title,
        });
      }

      // Buscar conversas sem label
      await dispatch('loadUntaggedConversations', filters);

      commit('setError', null);
    } catch (error) {
      console.error('Erro ao carregar dados do kanban:', error);
      commit('setError', error.message);
    } finally {
      commit('setLoading', false);
    }
  },

  // Carregar conversas de uma label específica
  async loadConversationsByLabel({ commit }, { labelId, labelTitle }) {
    try {
      // Buscar conversas com essa label
      const response = await API.get('/conversations', {
        params: {
          labels: [labelTitle],
          status: 'open,pending,resolved',
        },
      });

      const conversations = response.data.payload || [];
      commit('setConversationsByLabel', {
        labelId,
        conversations,
      });
    } catch (error) {
      console.error(
        `Erro ao carregar conversas da label ${labelId}:`,
        error
      );
    }
  },

  // Carregar conversas sem label
  async loadUntaggedConversations({ commit }, filters = {}) {
    try {
      const response = await API.get('/conversations', {
        params: {
          status: 'open,pending,resolved',
          ...filters,
        },
      });

      const allConversations = response.data.payload || [];
      // Filtrar apenas conversas que não têm labels
      const untagged = allConversations.filter(
        conv => !conv.labels || conv.labels.length === 0
      );

      commit('setUntaggedConversations', untagged);
    } catch (error) {
      console.error('Erro ao carregar conversas sem label:', error);
    }
  },

  // Mover conversa para uma label (adiciona a label à conversa)
  async moveConversationToLabel(
    { commit, state, dispatch },
    { conversationId, labelId, labelTitle }
  ) {
    try {
      commit('setLoading', true);

      // Chamar API para atualizar a label
      await kanbanService.updateConversationLabels(conversationId, [labelId]);

      // Atualizar estado local
      // Remover de untagged se estava lá
      const untaggedIndex = state.untaggedConversations.findIndex(
        c => c.id === conversationId
      );
      if (untaggedIndex !== -1) {
        commit('removeFromUntagged', untaggedIndex);
      }

      // Remover de outras labels
      for (const otherLabelId in state.conversationsByLabel) {
        const index = state.conversationsByLabel[otherLabelId].findIndex(
          c => c.id === conversationId
        );
        if (index !== -1) {
          commit('removeFromLabel', {
            labelId: otherLabelId,
            index,
          });
        }
      }

      // Recarregar dados da nova label
      await dispatch('loadConversationsByLabel', {
        labelId,
        labelTitle,
      });

      commit('setError', null);
    } catch (error) {
      console.error('Erro ao mover conversa:', error);
      commit('setError', error.message);
    } finally {
      commit('setLoading', false);
    }
  },

  // Remover conversa de uma label
  async removeConversationFromLabel(
    { commit, state },
    { conversationId, labelId }
  ) {
    try {
      // Chamar API para remover a label
      await kanbanService.updateConversationLabels(conversationId, []);

      const index = state.conversationsByLabel[labelId].findIndex(
        c => c.id === conversationId
      );

      if (index !== -1) {
        commit('removeFromLabel', {
          labelId,
          index,
        });
      }

      // Adicionar às conversas sem label
      const conversationIndex = state.conversationsByLabel[labelId].findIndex(
        c => c.id === conversationId
      );
      if (conversationIndex !== -1) {
        const conversation =
          state.conversationsByLabel[labelId][conversationIndex];
        commit('addToUntagged', conversation);
      }

      commit('setError', null);
    } catch (error) {
      console.error('Erro ao remover conversa da label:', error);
      commit('setError', error.message);
    }
  },

  // Refresh dos dados
  async refreshKanbanData({ dispatch }, filters = {}) {
    await dispatch('loadKanbanData', filters);
  },
};

const mutations = {
  setLoading(state, value) {
    state.isLoading = value;
  },

  setError(state, error) {
    state.error = error;
  },

  setKanbanLabels(state, labels) {
    state.kanbanLabels = labels;
  },

  setConversationsByLabel(state, { labelId, conversations }) {
    state.conversationsByLabel[labelId] = conversations;
  },

  setUntaggedConversations(state, conversations) {
    state.untaggedConversations = conversations;
  },

  removeFromLabel(state, { labelId, index }) {
    if (state.conversationsByLabel[labelId]) {
      state.conversationsByLabel[labelId].splice(index, 1);
    }
  },

  removeFromUntagged(state, index) {
    state.untaggedConversations.splice(index, 1);
  },

  addToUntagged(state, conversation) {
    if (
      !state.untaggedConversations.find(c => c.id === conversation.id)
    ) {
      state.untaggedConversations.push(conversation);
    }
  },

  updateConversationInLabel(state, { labelId, conversation }) {
    const index = state.conversationsByLabel[labelId].findIndex(
      c => c.id === conversation.id
    );
    if (index !== -1) {
      state.conversationsByLabel[labelId].splice(index, 1, conversation);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
