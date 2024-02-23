import { Router } from 'express';
const router = Router();
import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { validateOtherUserIdParam } from '../middleware/validationMiddleware.js';

router.route('/').post(sendMessage);

router.route('/:otherUserId').get(validateOtherUserIdParam, getMessages);

router.route('/:conversationId').patch(updateMessage);

router.route('/:conversationId/delete').patch(deleteMessage);

export default router;
