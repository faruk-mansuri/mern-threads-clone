import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
        };
      }
    },

    setSelectedConversation: (state, { payload }) => {
      state.selectedConversation = payload;
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
  },
});

export const {
  setConversations,
  addConversations,
  updateLastMessageConversations,
  setSelectedConversation,
  updateLastMessageSeenConversations,
} = chatSlice.actions;
export default chatSlice.reducer;
