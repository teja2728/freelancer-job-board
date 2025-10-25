import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { addReview, getFreelancerReviews, addReviewByFreelancerId } from '../controllers/reviewController.js';

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

// Alias: POST /api/reviews/create/:freelancerId with body { jobId, rating, comment }
router.post(
  '/create/:freelancerId',
  protect,
  [body('jobId').notEmpty(), body('rating').isInt({ min: 1, max: 5 })],
  addReviewByFreelancerId
);

export default router;
