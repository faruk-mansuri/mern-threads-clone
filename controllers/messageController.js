import { BadRequestError } from '../errors/customError.js';
import Conversation from '../models/ConversationModal.js';
import Message from '../models/MessageModal.js';
import { StatusCodes } from 'http-status-codes';
import { getRecipientSocketId, io } from '../socket/socket.js';
import cloudinary from 'cloudinary';

export const sendMessage = async (req, res) => {
  const { recipientId, message } = req.body;
  let { img } = req.body;
  const senderId = req.user.userId;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
      lastMessage: {
        text: message,
        sender: senderId,
      },
    });
  }

  if (img) {
    const response = await cloudinary.v2.uploader.upload(img);
    img = response.secure_url;
  }

  const newMessage = new Message({
    conversationId: conversation._id,
    sender: senderId,
    text: message,
    img: img || '',
  });

  await Promise.all([
    newMessage.save(),
    conversation.updateOne({
      lastMessage: {
        text: message,
        sender: senderId,
      },
    }),
  ]);

  const recipientSocketId = getRecipientSocketId(recipientId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('newMessage', newMessage);
  }

  res.status(StatusCodes.CREATED).json({ newMessage });
};

export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const { userId } = req.user;

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
  });

  if (!conversation) throw new BadRequestError('Conversation not found');

  const messages = await Message.find({
    conversationId: conversation._id,
  }).sort('createdAt');

  res.status(StatusCodes.OK).json({ messages });
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
