import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { addReview, getFreelancerReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('jobId').notEmpty(),
    body('freelancerId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  addReview
);

router.get('/freelancer/:id', getFreelancerReviews);

export default router;
