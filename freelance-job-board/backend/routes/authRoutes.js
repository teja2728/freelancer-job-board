import express from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['Client', 'Freelancer'])
  ],
  register
);

router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 })], login);
router.get('/me', protect, me);

export default router;
