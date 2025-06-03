import express from 'express';
import User from '../models/User.js';
import Note from '../models/Note.js';
import { protect, admin } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    const query = {};
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get notes count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const notesCount = await Note.countDocuments({ user: user._id });
        return {
          ...user._doc,
          notesCount
        };
      })
    );
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users: usersWithCounts
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    
    // Get all notes by the user
    const notes = await Note.find({ user: req.params.id });
    
    // Delete all files associated with the notes
    notes.forEach(note => {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Delete all notes by the user
    await Note.deleteMany({ user: req.params.id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ success: true, message: 'User and all associated notes deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/notes
// @desc    Get all notes
// @access  Private/Admin
router.get('/notes', protect, admin, async (req, res) => {
  try {
    const { search, fileType, userId, limit = 10, page = 1 } = req.query;
    const query = {};
    
    // Add filters if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    if (fileType) {
      query.fileType = fileType;
    }
    
    if (userId) {
      query.user = userId;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get notes with pagination
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username email profilePicture starAchievement');
    
    // Get total count for pagination
    const total = await Note.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: notes.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      notes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/make-admin/:id
// @desc    Make a user an admin
// @access  Private/Admin
router.post('/make-admin/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    return res.status(200).json({ success: true, message: 'User is now an admin' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;