import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import User from '../models/User.js';

export const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const job = await Job.create({ ...req.body, clientId: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOpenJobs = async (req, res) => {
  try {
    const { category, minBudget, maxBudget, q, sort } = req.query;
    const filter = { status: 'Open' };
    if (category) filter.category = category;
    if (minBudget || maxBudget) filter.budget = {};
    if (minBudget) filter.budget.$gte = Number(minBudget);
    if (maxBudget) filter.budget.$lte = Number(maxBudget);
    if (q) filter.title = { $regex: q, $options: 'i' };

    const sortBy = sort === 'budget' ? { budget: 1 } : { createdAt: -1 };

    const jobs = await Job.find(filter).sort(sortBy);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const role = req.user.role;
    if (role === 'Client') {
      const jobs = await Job.find({ clientId: req.user._id }).sort({ createdAt: -1 });
      const stats = {
        total: jobs.length,
        open: jobs.filter(j => j.status === 'Open').length,
        inProgress: jobs.filter(j => j.status === 'In Progress').length,
        completed: jobs.filter(j => j.status === 'Completed').length,
      };
      return res.json({ jobs, stats });
    } else {
      const jobs = await Job.find({ freelancerId: req.user._id }).sort({ createdAt: -1 });
      const stats = {
        total: jobs.length,
        inProgress: jobs.filter(j => j.status === 'In Progress').length,
        completed: jobs.filter(j => j.status === 'Completed').length,
      };
      return res.json({ jobs, stats });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('clientId', 'name role').populate('freelancerId', 'name role').populate('bids.freelancerId', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });

    const { status, freelancerId, ...rest } = req.body;

    if (status) {
      const allowed = ['Open', 'In Progress', 'Completed'];
      if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
      job.status = status;
    }
    if (freelancerId) job.freelancerId = freelancerId;
    Object.assign(job, rest);

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });

    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const placeBid = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'Open') return res.status(400).json({ message: 'Job not open' });
    if (job.clientId.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Client cannot bid' });

    const already = job.bids.find(b => b.freelancerId.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already bid' });

    job.bids.push({ freelancerId: req.user._id, amount: req.body.amount, message: req.body.message || '' });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const claimJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'Open') return res.status(400).json({ message: 'Job not open' });
    if (job.bids.length > 0) return res.status(400).json({ message: 'Cannot claim, bids exist' });

    job.freelancerId = req.user._id;
    job.status = 'In Progress';
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptBid = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });
    if (job.status !== 'Open') return res.status(400).json({ message: 'Job not open' });

    const bid = job.bids.id(req.params.bidId) || job.bids.find(b => b._id.toString() === req.params.bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    job.freelancerId = bid.freelancerId;
    job.status = 'In Progress';
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markCompleted = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });
    if (job.status !== 'In Progress') return res.status(400).json({ message: 'Job not in progress' });

    job.status = 'Completed';
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignFreelancer = async (req, res) => {
  try {
    const { id: jobId, freelancerId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });
    if (job.status !== 'Open') return res.status(400).json({ message: 'Job not open' });

    job.freelancerId = freelancerId;
    job.status = 'In Progress';
    // mark accepted bid if exists
    job.bids = job.bids.map(b => ({ ...b.toObject(), status: b.freelancerId.toString() === freelancerId ? 'Accepted' : 'Rejected' }));
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Open', 'In Progress', 'Completed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your job' });
    job.status = status;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const search = async (req, res) => {
  try {
    const { q = '', type = 'all', minRating, category, page = 1, limit = 10, sort = 'latest' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const results = {};

    if (type === 'all' || type === 'jobs') {
      const jobFilter = {};
      if (q) jobFilter.$or = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
      if (category) jobFilter.category = category;
      const jobSort = sort === 'budget' ? { budget: 1 } : { createdAt: -1 };
      const jobs = await Job.find(jobFilter).sort(jobSort).skip(skip).limit(Number(limit));
      const total = await Job.countDocuments(jobFilter);
      results.jobs = { items: jobs, total };
    }

    if (type === 'all' || type === 'freelancers') {
      const userFilter = { role: 'Freelancer' };
      if (q) userFilter.$or = [{ name: { $regex: q, $options: 'i' } }, { skills: { $elemMatch: { $regex: q, $options: 'i' } } }];
      if (minRating) userFilter.rating = { $gte: Number(minRating) };
      const freelancers = await User.find(userFilter).sort({ rating: -1 }).skip(skip).limit(Number(limit)).select('-password');
      const total = await User.countDocuments(userFilter);
      results.freelancers = { items: freelancers, total };
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
