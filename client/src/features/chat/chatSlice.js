import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  conversations: [],
  selectedConversation: {
    _id: null,
    userId: null,
    username: null,
    userProfilePic: null,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, { payload }) => {
      state.conversations = payload;
    },
    addConversations: (state, { payload }) => {
      state.conversations.unshift(payload);
    },
    updateLastMessageConversations: (state, { payload }) => {
      let conversation = state.conversations.find(
        (c) => c._id === payload.conversationId
      );

      if (conversation) {
        conversation.lastMessage = {
          text: payload.messageText,
          sender: payload.sender,
          img: payload?.img || '',
          createdAt: payload.createdAt,
        };
      }
    },

    setSelectedConversation: (state, { payload }) => {
      state.selectedConversation = payload;
    },
    removeSelectedConversation: (state) => {
      state.selectedConversation = {
        _id: null,
        userId: null,
        username: null,
        userProfilePic: null,
      };
    },

    updateLastMessageSeenConversations: (state, { payload }) => {
      state.conversations = state.conversations.map((conversation) => {
        if (conversation._id === payload) {
          return {
            ...conversation,
            lastMessage: { ...conversation.lastMessage, seen: true },
          };
        }
        return conversation;
      });
    },

    updateEditLastMessageConversations: (state, { payload }) => {
      let conversation = state.conversations.find(
        (c) => c._id === payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = {
          text: payload.text,
          sender: payload.sender,
          seen: payload.seen,
          deleted: payload.deleted,
          createdAt: payload.createdAt,
        };
      }
    },
  },
});

export const {
  setConversations,
  addConversations,
  updateLastMessageConversations,
  setSelectedConversation,
  removeSelectedConversation,
  updateLastMessageSeenConversations,
  updateEditLastMessageConversations,
} = chatSlice.actions;
export default chatSlice.reducer;
