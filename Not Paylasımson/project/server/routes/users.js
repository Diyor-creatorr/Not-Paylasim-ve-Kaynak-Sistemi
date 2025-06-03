import express from 'express';
import User from '../models/User.js';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    // Get user's notes count
    const notesCount = await Note.countDocuments({ user: req.user._id });
    
    return res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        notesCount
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    // Get user's notes count
    const notesCount = await Note.countDocuments({ user: req.params.id });
    
    return res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        notesCount
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if username or email is already taken
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user._id } },
          { $or: [
            { username: username || '' },
            { email: email || '' }
          ]}
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor' 
        });
      }
    }
    
    // Update profile picture if provided
    let profilePicture = req.user.profilePicture;
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      
      // Delete old profile picture if exists
      if (req.user.profilePicture) {
        const oldFilePath = path.join(__dirname, '..', req.user.profilePicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Generate unique filename
      const fileName = `profile-${req.user._id}-${Date.now()}${path.extname(file.name)}`;
      const filePath = path.join(__dirname, '..', 'uploads', fileName);
      
      // Move file to uploads folder
      await file.mv(filePath);
      profilePicture = `/uploads/${fileName}`;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        username: username || req.user.username,
        email: email || req.user.email,
        profilePicture
      },
      { new: true }
    ).select('-password');
    
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return res.status(500).json({ success: false, message: 'Profil güncellenirken bir hata oluştu' });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching users...'); // Debug log

    // Mevcut kullanıcıyı hariç tut ve sadece gerekli alanları seç
    const users = await User.find(
      { _id: { $ne: req.user._id } },
      { password: 0, email: 0 }
    ).select('username profilePicture');

    console.log('Found users:', users); // Debug log

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Kullanıcılar yüklenirken bir hata oluştu',
      error: error.message 
    });
  }
});

export default router;