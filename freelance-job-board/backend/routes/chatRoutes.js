import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages } from '../controllers/chatController.js';

const router = express.Router();

router.post('/send/:jobId', protect, sendMessage);
router.get('/messages/:jobId', protect, getMessages);

export default router;
