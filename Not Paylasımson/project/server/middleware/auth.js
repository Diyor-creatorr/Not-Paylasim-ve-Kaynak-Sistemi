import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify user is authenticated
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu sayfaya erişim için giriş yapmanız gerekiyor'
      });
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kullanıcıyı bul
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return res.status(401).json({
        success: false,
        message: 'Oturum süreniz dolmuş olabilir, lütfen tekrar giriş yapın'
      });
    }
  } catch (error) {
    console.error('Kimlik doğrulama hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  }
};

// Middleware to check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Bu sayfaya erişim için yönetici yetkisi gerekiyor' 
    });
  }
};