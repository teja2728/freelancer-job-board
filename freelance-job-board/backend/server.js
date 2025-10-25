import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// Health
app.get('/', (req, res) => res.json({ status: 'OK', service: 'freelance-job-board' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

// Socket.io events
io.on('connection', (socket) => {
  socket.on('join', ({ jobId }) => {
    if (jobId) socket.join(`job:${jobId}`);
  });

  socket.on('leave', ({ jobId }) => {
    if (jobId) socket.leave(`job:${jobId}`);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
