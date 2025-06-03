import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Note from '../models/Note.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_FOLDER = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.includes('document') || mimetype.includes('msword') || 
      mimetype.includes('officedocument')) return 'document';
  return 'other';
};

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Check if file is uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const file = req.files.file;
    const fileType = getFileType(file.mimetype);
    
    // Create file name with user ID and timestamp
    const fileName = `${req.user._id}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(UPLOADS_FOLDER, fileName);
    
    // Move file to uploads folder
    await file.mv(filePath);
    
    // Create note in database
    const note = await Note.create({
      title,
      description,
      fileUrl: `/uploads/${fileName}`,
      fileType,
      user: req.user._id
    });

    // Check if user has 10+ notes for star achievement
    const noteCount = await Note.countDocuments({ user: req.user._id });
    if (noteCount >= 10 && !req.user.starAchievement) {
      await User.findByIdAndUpdate(req.user._id, { starAchievement: true });
    }

    return res.status(201).json({ success: true, note });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notes
// @desc    Get all notes (with optional filtering)
// @access  Public
router.get('/', async (req, res) => {
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
      .populate('user', 'username profilePicture starAchievement');
    
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

// @route   GET /api/notes/:id
// @desc    Get note by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'username profilePicture starAchievement');
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Increment view count
    note.views += 1;
    await note.save();
    
    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Check if note exists
    let note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Check if user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this note' });
    }
    
    // Update note fields
    note.title = title || note.title;
    note.description = description || note.description;
    
    // Save updated note
    await note.save();
    
    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if note exists
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Check if user owns the note or is admin
    if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }
    
    // Delete file from uploads folder
    const filePath = path.join(__dirname, '..', note.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete note from database
    await Note.findByIdAndDelete(req.params.id);
    
    // Check if user still qualifies for star achievement
    if (req.user.starAchievement) {
      const noteCount = await Note.countDocuments({ user: req.user._id });
      if (noteCount < 10) {
        await User.findByIdAndUpdate(req.user._id, { starAchievement: false });
      }
    }
    
    return res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notes/download/:id
// @desc    Download note file
// @access  Public
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Increment download count
    note.downloads += 1;
    await note.save();
    
    // Get file path
    const filePath = path.join(__dirname, '..', note.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // Send file for download
    return res.download(filePath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;