import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, FileText, AlertCircle } from 'lucide-react';
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

const MyNotesPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotes();
  }, [currentPage, fileTypeFilter, searchTerm]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notes', {
        params: {
          userId: user?._id,
          page: currentPage,
          limit: 9,
          fileType: fileTypeFilter || undefined,
          search: searchTerm || undefined
        },
        withCredentials: true
      });
      
      setNotes(response.data.notes || []);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err: any) {
      setError('Notlarınız yüklenirken bir hata oluştu');
      setNotes([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotes();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Notlarım</h1>
        <p className="text-gray-600">Paylaştığınız tüm notları buradan yönetebilirsiniz</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Notlarınızda arama yapın..."
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

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-start">
          <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-gray-100 p-8 text-center rounded-lg">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz not paylaşmamışsınız</h3>
          <p className="text-gray-600 mb-6">
            İlk notunuzu paylaşarak başlayın ve diğer kullanıcılarla bilgi alışverişinde bulunun.
          </p>
          <a
            href="/notes/create"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Not Paylaş
          </a>
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
  );
};

export default MyNotesPage;