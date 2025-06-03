import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Search, User, Star, AlertCircle } from 'lucide-react';
import NoteCard from '../components/notes/NoteCard';

interface Note {
  _id: string;
  title: string;
  description: string;
  fileType: string;
  views: number;
  downloads: number;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    profilePicture: string;
    starAchievement: boolean;
  };
}

interface UserProfile {
  _id: string;
  username: string;
  profilePicture: string;
  starAchievement: boolean;
  notesCount: number;
}

const UserNotesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userRes = await axios.get(`/api/users/${id}`);
        
        if (userRes.data.success) {
          setUser(userRes.data.user);
          
          // Fetch user's notes
          const notesRes = await axios.get('/api/notes', {
            params: {
              userId: id,
              page: currentPage,
              limit: 9,
              fileType: fileTypeFilter || undefined,
              search: searchTerm || undefined
            }
          });
          
          if (notesRes.data.success) {
            setNotes(notesRes.data.notes);
            setTotalPages(notesRes.data.totalPages);
          }
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user notes');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserAndNotes();
    }
  }, [id, currentPage, fileTypeFilter, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-start">
        <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold mb-2">Kullanıcı bulunamadı</h2>
          <p>{error || 'Bu kullanıcı mevcut değil veya silinmiş olabilir.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* User Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-500" />
                </div>
              )}
              {user.starAchievement && (
                <div className="absolute -top-1 -right-1">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
            
            <div className="ml-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">{user.username}</h1>
                {user.starAchievement && (
                  <div className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Yıldızlı Kullanıcı
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mt-1">
                {user.notesCount} not paylaşımı
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`${user.username}'in notlarında ara...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Dosya Türleri</option>
              <option value="pdf">PDF</option>
              <option value="image">Resim</option>
              <option value="document">Belge</option>
              <option value="other">Diğer</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ara
            </button>
          </form>
        </div>
      </div>
      
      {/* Notes Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {searchTerm ? `"${searchTerm}" için Arama Sonuçları` : `${user.username}'in Notları`}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gray-100 p-8 text-center rounded-lg">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Not bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Arama kriterlerinize uygun not bulunamadı. Lütfen farklı bir arama yapmayı deneyin.'
                : `${user.username} henüz not paylaşmamış.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Önceki
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber: number;
                    
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserNotesPage;