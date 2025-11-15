import express from 'express';
import { sendTestEmail } from '../controllers/testEmailController.js';

const router = express.Router();

// POST /api/test-email { email }
router.post('/', sendTestEmail);

export default router;
