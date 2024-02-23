import { Router } from 'express';
const router = Router();
import {
  createConversation,
  getConversations,
} from '../controllers/conversationController.js';

router.route('/').get(getConversations).post(createConversation);

export default router;
