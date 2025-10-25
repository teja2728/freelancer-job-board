import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
    bids: [bidSchema]
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
