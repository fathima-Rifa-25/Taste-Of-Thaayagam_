import express from 'express';
import { createMessage, listMessages, markAsRead } from '../controllers/messageController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public endpoint to create a message
router.post('/', createMessage);

// Admin endpoints
router.get('/', adminAuth, listMessages);
router.put('/:id/read', adminAuth, markAsRead);

export default router;
