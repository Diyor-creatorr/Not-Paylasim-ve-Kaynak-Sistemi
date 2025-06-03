import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, email, password } = req.body;

    // Log received data
    console.log('Received data:', {
      username: username || 'missing',
      email: email || 'missing',
      password: password ? '***' : 'missing'
    });

    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen tüm alanları doldurun',
        received: { 
          username: username || 'eksik', 
          email: email || 'eksik', 
          password: password ? '***' : 'eksik' 
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Geçersiz e-posta formatı'
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      console.log('Invalid username length:', username.length);
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı 3-20 karakter arasında olmalıdır'
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('Invalid password length:', password.length);
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log('User already exists:', userExists.email === email ? 'email' : 'username');
      return res.status(400).json({ 
        success: false, 
        message: userExists.email === email ? 
          'Bu e-posta adresi zaten kullanılıyor' : 
          'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      console.log('User created successfully:', user._id);
      // Generate token
      const token = generateToken(user._id);

      // Set cookie with token
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          starAchievement: user.starAchievement
        }
      });
    } else {
      console.log('Failed to create user');
      return res.status(400).json({ success: false, message: 'Geçersiz kullanıcı verisi' });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // Log received data
    console.log('Received data:', {
      email: email || 'missing',
      password: password ? '***' : 'missing'
    });

    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen e-posta ve şifrenizi girin',
        received: { 
          email: email || 'eksik', 
          password: password ? '***' : 'eksik' 
        }
      });
    }

    try {
      // Check if user exists
      console.log('Searching for user with email:', email);
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'E-posta veya şifre hatalı' 
        });
      }

      console.log('User found, comparing passwords...');
      // Check if password matches
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'E-posta veya şifre hatalı' 
        });
      }

      console.log('Login successful for user:', email);
      
      try {
        // Generate token
        const token = generateToken(user._id);
        console.log('Token generated successfully');

        // Set cookie with token
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });

        // Remove password from user object
        const userResponse = {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          starAchievement: user.starAchievement
        };

        return res.status(200).json({
          success: true,
          user: userResponse
        });
      } catch (tokenError) {
        console.error('Token generation error:', tokenError);
        return res.status(500).json({
          success: false,
          message: 'Token oluşturma hatası',
          error: tokenError.message
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      console.error('Error details:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Veritabanı hatası',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;