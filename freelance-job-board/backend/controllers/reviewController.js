import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

export const addReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { jobId, freelancerId, rating, comment } = req.body;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });
    if (job.status !== 'Completed') return res.status(400).json({ message: 'Job not completed' });
    if (job.freelancerId.toString() !== freelancerId) return res.status(400).json({ message: 'Freelancer mismatch' });

    const exists = await Review.findOne({ jobId, clientId: req.user._id, freelancerId });
    if (exists) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({ jobId, clientId: req.user._id, freelancerId, rating, comment });

    // Update freelancer aggregate rating and embedded reviews list
    const freelancer = await User.findById(freelancerId);
    if (freelancer) {
      const newCount = (freelancer.reviewCount || 0) + 1;
      const newRating = (((freelancer.rating || 0) * (freelancer.reviewCount || 0)) + Number(rating)) / newCount;
      freelancer.reviewCount = newCount;
      freelancer.rating = Number(newRating.toFixed(2));
      freelancer.reviews = freelancer.reviews || [];
      freelancer.reviews.push({ reviewer: req.user._id, comment: comment || '', stars: Number(rating) });
      await freelancer.save();
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFreelancerReviews = async (req, res) => {
  try {
    const { id } = req.params; // freelancerId
    const reviews = await Review.find({ freelancerId: id }).sort({ createdAt: -1 });
    const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0;
    res.json({ average: Number(avg.toFixed(2)), count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addReviewByFreelancerId = async (req, res) => {
  const { freelancerId } = req.params;
  const { jobId, rating, comment } = req.body || {};
  req.body = { jobId, freelancerId, rating, comment };
  return addReview(req, res);
};
