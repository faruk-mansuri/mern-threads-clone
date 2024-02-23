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
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Conversation not found.' });
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

export const updateMessage = async (req, res) => {
  const { userId } = req.user;
  const { conversationId } = req.params;
  const { messageId, recipientId, text } = req.body;

  if (!text)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Content is required.' });

  if (!conversationId)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Conversation ID missing.' });

  if (!messageId)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Message ID missing.' });

  const conversation = await Conversation.find({
    _id: conversationId,
  });
  if (!conversation)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Conversation not found.' });

  let message = await Message.findById({ _id: messageId });
  if (!message || message.deleted) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Message not found.' });
  }

  const member = conversation[0].participants.find((id) => '' + id === userId);
  if (!member)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Member not found' });

  if (userId !== '' + message?.sender)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: 'Unauthorized to update this message' });

  message.text = text;
  await message.save();

  const recipientSocketId = getRecipientSocketId(recipientId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('updatedMessage', message);
  }

  res.status(StatusCodes.OK).json({ message });
};

export const deleteMessage = async (req, res) => {
  const { userId } = req.user;
  const { conversationId } = req.params;
  const { messageId, recipientId } = req.body;

  if (!conversationId)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Conversation ID missing.' });

  if (!messageId)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Message ID missing.' });

  const conversation = await Conversation.find({
    _id: conversationId,
  });
  if (!conversation)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Conversation not found.' });

  let message = await Message.findById({ _id: messageId });
  if (!message || message.deleted) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Message not found.' });
  }

  const member = conversation[0].participants.find((id) => '' + id === userId);
  if (!member)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Member not found' });

  if (userId !== '' + message?.sender)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: 'Unauthorized to delete this message' });

  message.text = 'This message has been deleted';
  message.img = '';
  message.deleted = true;

  await message.save();

  const recipientSocketId = getRecipientSocketId(recipientId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('updatedMessage', message);
  }

  res.status(StatusCodes.OK).json({ message });
};
