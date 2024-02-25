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
    isEdited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
