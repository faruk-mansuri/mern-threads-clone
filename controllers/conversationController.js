import Conversation from '../models/ConversationModal.js';
import { StatusCodes } from 'http-status-codes';
import { getRecipientSocketId, io } from '../socket/socket.js';

export const createConversation = async (req, res) => {
  const { userId } = req.user;
  const { userId: otherUserId } = req.body;

  if (!otherUserId)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Other user ID is missing.' });

  let singleConversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
  });

  if (singleConversation) {
    return res.status(StatusCodes.OK).json({ singleConversation });
  }

  singleConversation = await Conversation.create({
    participants: [userId, otherUserId],
    lastMessage: {
      text: null,
      sender: null,
    },
  });

  const conversation = await Conversation.findOne({
    _id: singleConversation._id,
  }).populate({
    path: 'participants',
    select: 'username avatar',
  });

  const recipientSocketId = getRecipientSocketId(otherUserId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('newConversation', conversation);
  }

  return res.status(StatusCodes.OK).json({ conversation });
};

export const getConversations = async (req, res) => {
  const { userId } = req.user;
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate({
      path: 'participants',
      select: 'username avatar',
    })
    .sort('-createdAt');

  // remove current user from the participants array
  conversations.forEach((conversation) => {
    conversation.participants = conversation.participants.filter(
      (participant) => participant._id.toString() !== req.user.userId.toString()
    );
  });

  res.status(StatusCodes.OK).json({ conversations });
};
