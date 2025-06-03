import express from 'express';
import Message from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get messages between two users
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username profilePicture')
    .populate('receiver', 'username profilePicture');

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Mesajlar yüklenirken hata:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Mesajlar yüklenirken bir hata oluştu' 
    });
  }
});

// Send a new message
router.post('/messages', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Alıcı ve mesaj içeriği gereklidir'
      });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'username profilePicture');
    await message.populate('receiver', 'username profilePicture');

    // Emit socket event
    req.app.get('io').emit('message', message);

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Mesaj gönderilirken bir hata oluştu' 
    });
  }
});

// Get user's chat rooms
router.get('/rooms', protect, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id
    })
    .populate('participants', 'username profilePicture')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('Sohbet odaları yüklenirken hata:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Sohbet odaları yüklenirken bir hata oluştu' 
    });
  }
});

// Create a new chat room
router.post('/rooms', protect, async (req, res) => {
  try {
    const { name, participants } = req.body;
    
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Katılımcılar listesi gereklidir'
      });
    }

    const room = new ChatRoom({
      name,
      participants: [...participants, req.user._id],
      isPrivate: participants.length === 1
    });

    await room.save();
    await room.populate('participants', 'username profilePicture');

    return res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Sohbet odası oluşturulurken hata:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Sohbet odası oluşturulurken bir hata oluştu' 
    });
  }
});

export default router; 