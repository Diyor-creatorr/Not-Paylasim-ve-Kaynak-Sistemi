import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Star, FileText, Image, File, Edit, AlertCircle } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  description: string;
  fileType: string;
  views: number;
  downloads: number;
  createdAt: string;
}

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  starAchievement: boolean;
  notesCount: number;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileRes = await axios.get('/api/users/me', { withCredentials: true });
        
        if (profileRes.data.success) {
          setProfile(profileRes.data.user);
          
          // Fetch user's notes
          const notesRes = await axios.get('/api/notes', {
            params: { userId: profileRes.data.user._id, limit: 6 }
          });
          
          if (notesRes.data.success) {
            setNotes(notesRes.data.notes);
          }
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Function to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-start">
        <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold mb-2">Profil yüklenemedi</h2>
          <p>{error || 'Profil bilgileri yüklenirken bir hata oluştu.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="flex-shrink-0 relative mb-4 md:mb-0">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.username}
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-blue-500" />
                </div>
              )}
              {profile.starAchievement && (
                <div className="absolute top-0 right-0">
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
            
            <div className="md:ml-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center">
                <h1 className="text-2xl font-bold text-gray-800">{profile.username}</h1>
                {profile.starAchievement && (
                  <div className="mt-1 md:mt-0 md:ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Yıldızlı Kullanıcı
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mt-1">{profile.email}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-blue-600">Notlar</p>
                  <p className="text-xl font-semibold text-blue-800">{profile.notesCount}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-purple-600">Durum</p>
                  <p className="text-xl font-semibold text-purple-800">
                    {profile.starAchievement ? 'Yıldızlı' : 'Normal'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Profili Düzenle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Notlarım</h2>
            <Link
              to="/notes/create"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Yeni Not Ekle
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz not yüklemediniz</h3>
              <p className="text-gray-600 mb-4">İlk notunuzu yükleyerek başlayın.</p>
              <Link
                to="/notes/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Not Yükle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(note.fileType)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-800 line-clamp-1">{note.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{note.views} görüntülenme</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {notes.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                to={`/users/${profile._id}/notes`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Tüm Notlarımı Gör
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Achievement Info */}
      {!profile.starAchievement && (
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Star className="h-10 w-10 text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-yellow-800">Yıldızlı Kullanıcı Olun</h3>
              <p className="text-yellow-700 mt-1">
                10 veya daha fazla not yükleyerek yıldızlı kullanıcı rozeti kazanabilirsiniz. 
                Şu ana kadar {profile.notesCount} not yüklediniz, yıldızlı kullanıcı olmak için {Math.max(0, 10 - profile.notesCount)} not daha yüklemeniz gerekiyor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;