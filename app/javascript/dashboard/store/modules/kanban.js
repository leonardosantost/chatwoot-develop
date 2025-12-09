import kanbanService from 'dashboard/services/kanbanService';
import LabelsAPI from 'dashboard/api/labels';

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
      const labelsResponse = await LabelsAPI.get();
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
      const response = await kanbanService.getConversations({
        labels: [labelTitle],
        status: 'all',
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
      const response = await kanbanService.getConversations({
        status: 'all',
        ...filters,
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
    { commit, state },
    { conversationId, fromLabelId, labelId, labelTitle, toIndex }
  ) {
    try {
      commit('setLoading', true);

      const fromColumn =
        fromLabelId === 'untagged'
          ? state.untaggedConversations
          : state.conversationsByLabel[fromLabelId] || [];
      const conversationFromSource = fromColumn.find(
        conversation => conversation.id === conversationId
      );

      const conversation =
        conversationFromSource ||
        state.untaggedConversations.find(
          currentConversation => currentConversation.id === conversationId
        ) ||
        Object.values(state.conversationsByLabel || {})
          .flatMap(
            (columnConversations) => columnConversations || []
          )
          .find(
            currentConversation => currentConversation.id === conversationId
          );

      if (labelId === fromLabelId && conversation) {
        commit('moveConversation', {
          conversation,
          fromLabelId,
          toLabelId: labelId,
          toIndex,
        });
        commit('setLoading', false);
        return;
      }

      const kanbanLabelTitles = state.kanbanLabels.map(label => label.title);
      const preservedLabels = (conversation?.labels || []).filter(
        label => !kanbanLabelTitles.includes(label)
      );

      const shouldAttachLabel = labelId !== 'untagged' && labelTitle;
      const labelsToPersist = shouldAttachLabel
        ? [...preservedLabels, labelTitle]
        : preservedLabels;
      const uniqueLabels = [...new Set(labelsToPersist)];

      if (uniqueLabels.length > 0) {
        await kanbanService.updateConversationLabels(
          conversationId,
          uniqueLabels
        );
      } else {
        await kanbanService.updateConversationLabels(conversationId, []);
      }

      const updatedConversation = conversation
        ? { ...conversation, labels: uniqueLabels }
        : { id: conversationId, labels: uniqueLabels };

      commit('moveConversation', {
        conversation: updatedConversation,
        fromLabelId,
        toLabelId: labelId,
        toIndex,
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

  moveConversation(state, { conversation, fromLabelId, toLabelId, toIndex }) {
    const removeFromList = labelId => {
      if (!labelId && labelId !== 0) {
        return null;
      }
      if (labelId === 'untagged') {
        const index = state.untaggedConversations.findIndex(
          currentConversation => currentConversation.id === conversation.id
        );
        if (index !== -1) {
          return state.untaggedConversations.splice(index, 1)[0];
        }
        return null;
      }

      const sourceList = state.conversationsByLabel[labelId];
      if (!sourceList) {
        return null;
      }
      const index = sourceList.findIndex(
        currentConversation => currentConversation.id === conversation.id
      );
      if (index === -1) {
        return null;
      }
      return sourceList.splice(index, 1)[0];
    };

    let removedConversation = removeFromList(fromLabelId);
    if (!removedConversation) {
      removedConversation = removeFromList('untagged');
    }

    Object.keys(state.conversationsByLabel).forEach(labelKey => {
      if (labelKey === fromLabelId || labelKey === toLabelId) {
        return;
      }
      removeFromList(labelKey);
    });

    if (toLabelId !== 'untagged') {
      removeFromList('untagged');
    }

    const conversationToInsert = removedConversation || conversation;

    const targetList =
      toLabelId === 'untagged'
        ? state.untaggedConversations
        : (state.conversationsByLabel[toLabelId] =
            state.conversationsByLabel[toLabelId] || []);

    const insertionIndex = Number.isInteger(toIndex)
      ? Math.max(0, Math.min(toIndex, targetList.length))
      : targetList.length;

    targetList.splice(insertionIndex, 0, conversationToInsert);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
