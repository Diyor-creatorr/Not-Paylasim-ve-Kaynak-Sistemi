import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FileText, BookOpen } from 'lucide-react';
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

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotes();
  }, [currentPage, fileTypeFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notes', {
        params: {
          page: currentPage,
          limit: 9,
          fileType: fileTypeFilter || undefined,
          search: searchTerm || undefined
        }
      });
      
      // Ensure notes is always an array even if response.data.notes is undefined
      setNotes(response.data.notes || []);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch notes');
      console.error(err);
      // Reset notes to empty array on error
      setNotes([]);
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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl overflow-hidden shadow-xl mb-10">
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Bilgi Paylaştıkça Çoğalır
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100">
                Notlarınızı paylaşın, diğer kullanıcıların kaynaklarına erişin ve 
                öğrenme yolculuğunuzda birbirinize destek olun.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="#search-section"
                  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-50 transition-colors text-center"
                >
                  Notları Keşfet
                </a>
                <a
                  href="/notes/create"
                  className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-900 transition-colors text-center"
                >
                  Not Paylaş
                </a>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-400 rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-purple-500 rounded-full opacity-30"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-lg transform rotate-3">
                  <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-800 text-center font-medium">
                    Yüzlerce öğrencinin katkıda bulunduğu bir bilgi havuzu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section id="search-section" className="mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Not başlığı veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Dosya Türleri</option>
              <option value="pdf">PDF</option>
              <option value="image">Resim</option>
              <option value="document">Belge</option>
              <option value="other">Diğer</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ara
            </button>
          </form>
        </div>
      </section>

      {/* Notes Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {searchTerm ? `"${searchTerm}" için Arama Sonuçları` : 'Son Eklenen Notlar'}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gray-100 p-8 text-center rounded-lg">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz not bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Arama kriterlerinize uygun not bulunamadı. Lütfen farklı bir arama yapmayı deneyin.'
                : 'Henüz sisteme not eklenmemiş. İlk notu siz eklemek ister misiniz?'}
            </p>
            {!searchTerm && (
              <a
                href="/notes/create"
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Not Ekle
              </a>
            )}
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
                    
                    // Logic to show appropriate page numbers
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
      </section>
    </div>
  );
};

export default HomePage;