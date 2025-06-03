import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';


// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

console.log('Looking for .env file at:', envPath);
dotenv.config({ path: envPath });

// Set default environment variables if not present
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sifre@cluster0.tob8c.mongodb.net/database';
process.env.PORT = process.env.PORT || 5000;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Routes
import authRoutes from './routes/auth.js';
import noteRoutes from './routes/notes.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

// Config
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Connected users map
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('userConnected', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Basarili baglandi');
    console.log('Environment variables yuklendi:');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('- MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
  })
  .catch(err => {
    console.error('MongoDB baglanti hatasi:', err);
    process.exit(1);
  });

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portunda calisiyor`);
});
