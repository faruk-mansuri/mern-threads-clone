import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Types.ObjectId,
      ref: 'Conversation',
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    seen: { type: Boolean, default: false },
    img: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
