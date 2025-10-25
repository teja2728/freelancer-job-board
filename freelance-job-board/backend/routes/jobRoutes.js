import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createJob,
  getOpenJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  placeBid,
  claimJob,
  acceptBid,
  markCompleted,
  assignFreelancer,
  updateStatus,
  search
} from '../controllers/jobController.js';

const router = express.Router();

// Public list of open jobs
router.get('/', getOpenJobs);
// Authenticated dashboard list
router.get('/me/list', protect, getMyJobs);
// Aliases
router.get('/available', getOpenJobs);
router.get('/my-jobs', protect, getMyJobs);
router.get('/search', search);

// Single job details (keep after specific routes)
router.get('/:id', getJobById);

// Client create/delete/update
router.post(
  '/',
  protect,
  requireRole('Client'),
  [body('title').notEmpty(), body('description').notEmpty(), body('category').notEmpty(), body('budget').isNumeric()],
  createJob
);
// Alias
router.post(
  '/create',
  protect,
  requireRole('Client'),
  [body('title').notEmpty(), body('description').notEmpty(), body('category').notEmpty(), body('budget').isNumeric()],
  createJob
);

router.put('/:id', protect, requireRole('Client'), updateJob);
router.delete('/:id', protect, requireRole('Client'), deleteJob);

// Freelancer actions
router.post('/:id/bid', protect, requireRole('Freelancer'), [body('amount').isNumeric()], placeBid);
router.post('/bid/:id', protect, requireRole('Freelancer'), [body('amount').isNumeric()], placeBid);
router.post('/:id/claim', protect, requireRole('Freelancer'), claimJob);

// Client accept bid and mark completed
router.post('/:id/accept/:bidId', protect, requireRole('Client'), acceptBid);
router.post('/:id/complete', protect, requireRole('Client'), markCompleted);
router.put('/assign/:id/:freelancerId', protect, requireRole('Client'), assignFreelancer);
router.put('/status/:id', protect, requireRole('Client'), updateStatus);

export default router;
