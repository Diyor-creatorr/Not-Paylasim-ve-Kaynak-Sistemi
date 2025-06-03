import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings, 
  Star, 
  FileText, 
  MessageSquare 
} from 'lucide-react';
import { createStandaloneToast } from '@chakra-ui/react';

// Types
interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  isProtected?: boolean;
  isAdmin?: boolean;
}

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onClose: () => void;
}

// Components
const UserAvatar: React.FC<{ user: any }> = ({ user }) => (
  <div className="relative">
    {user.profilePicture ? (
      <img
        src={user.profilePicture}
        alt={user.username}
        className="h-8 w-8 rounded-full object-cover"
      />
    ) : (
      <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center">
        <span className="text-sm font-medium text-white">
          {user.username.charAt(0).toUpperCase()}
        </span>
      </div>
    )}
    {user.starAchievement && (
      <div className="absolute -top-1 -right-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      </div>
    )}
  </div>
);

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onClose }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 text-gray-800">
    <Link
      to="/profile"
      className="block px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
      onClick={onClose}
    >
      <User className="h-4 w-4" />
      <span>Profilim</span>
    </Link>
    {user.role === 'admin' && (
      <Link
        to="/admin"
        className="block px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
        onClick={onClose}
      >
        <Settings className="h-4 w-4" />
        <span>Admin Paneli</span>
      </Link>
    )}
    <button
      onClick={onLogout}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
    >
      <LogOut className="h-4 w-4" />
      <span>Çıkış Yap</span>
    </button>
  </div>
);

const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ 
  to, 
  children, 
  onClick 
}) => (
  <Link
    to={to}
    className="hover:text-blue-200 transition-colors"
    onClick={onClick}
  >
    {children}
  </Link>
);

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Ana Sayfa' },
    { 
      path: '/notes/create', 
      label: 'Not Yükle', 
      isProtected: true 
    },
    { 
      path: '/my-notes', 
      label: 'Notlarım', 
      icon: <FileText className="h-4 w-4 inline mr-1" />,
      isProtected: true 
    },
    { 
      path: '/chat', 
      label: 'Sohbet', 
      icon: <MessageSquare className="h-4 w-4 inline mr-1" />,
      isProtected: true 
    },
  ];

  const renderNavItems = (items: NavItem[], isMobile: boolean = false) => (
    <>
      {items.map((item) => {
        if (item.isProtected && !user) return null;
        if (item.isAdmin && user?.role !== 'admin') return null;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setIsMenuOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        );
      })}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <span className="text-xl font-bold">NotePaylasim</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {renderNavItems(navItems)}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 hover:text-blue-200 transition-colors focus:outline-none"
                >
                  <UserAvatar user={user} />
                  <span>{user.username}</span>
                </button>
                {isProfileOpen && (
                  <UserMenu
                    user={user}
                    onLogout={handleLogout}
                    onClose={() => setIsProfileOpen(false)}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <NavLink to="/login">Giriş Yap</NavLink>
                <Link
                  to="/register"
                  className="bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-blue-500">
            {renderNavItems(navItems, true)}
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profilim
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-300 hover:text-red-100 transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                  Giriş Yap
                </NavLink>
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                  Kayıt Ol
                </NavLink>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;