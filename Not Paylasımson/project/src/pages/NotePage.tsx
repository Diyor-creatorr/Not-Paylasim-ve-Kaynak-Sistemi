import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Image, File, Download, Eye, Calendar, Trash2, Edit, Star, AlertCircle } from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
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

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/notes/${id}`);
        setNote(response.data.note);
      } catch (err) {
        setError('Failed to fetch note details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNote();
    }
  }, [id]);

  const handleDownload = async () => {
    try {
      window.open(`http://localhost:5000/api/notes/download/${id}`, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`/api/notes/${note._id}`, { withCredentials: true });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  const renderFilePreview = () => {
    if (!note) return null;

    switch (note.fileType) {
      case 'pdf':
        return (
          <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`http://localhost:5000${note.fileUrl}#toolbar=0`}
              className="w-full h-full"
              title={note.title}
            />
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={`http://localhost:5000${note.fileUrl}`}
              alt={note.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/400x400?text=Resim+Yüklenemedi';
              }}
            />
          </div>
        );
      case 'document':
        return (
          <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-blue-500" />
              <p className="mt-2 text-sm text-gray-600">Belge</p>
              <p className="text-xs text-gray-500 mt-1">İndirmek için butona tıklayın</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <File className="h-16 w-16 text-gray-500" />
              <p className="mt-2 text-sm text-gray-600">Dosya</p>
              <p className="text-xs text-gray-500 mt-1">İndirmek için butona tıklayın</p>
            </div>
          </div>
        );
    }
  };

  const canManageNote = user && note && (user._id === note.user._id || user.role === 'admin');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-start">
        <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold mb-2">Not bulunamadı</h2>
          <p className="mb-4">{error || 'Bu not mevcut değil veya silinmiş olabilir.'}</p>
          <Link
            to="/"
            className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(note.createdAt).toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Note Header */}
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{note.title}</h1>
            
            {canManageNote && (
              <div className="flex space-x-3">
                <Link
                  to={`/notes/edit/${note._id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Link>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
            <span className="mx-2">•</span>
            <Eye className="h-4 w-4 mr-1" />
            <span>{note.views} görüntülenme</span>
            <span className="mx-2">•</span>
            <Download className="h-4 w-4 mr-1" />
            <span>{note.downloads} indirme</span>
          </div>
        </div>
        
        {/* Note Content */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* File Preview */}
            <div className="md:w-1/3 flex flex-col items-center">
              {renderFilePreview()}
              
              <button
                onClick={handleDownload}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </button>
            </div>
            
            {/* Note Details */}
            <div className="md:w-2/3">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Açıklama</h2>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{note.description}</p>
              
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Yükleyen</h2>
                <Link
                  to={`/users/${note.user._id}/notes`}
                  className="flex items-center group"
                >
                  <div className="relative">
                    {note.user.profilePicture ? (
                      <img
                        src={note.user.profilePicture}
                        alt={note.user.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {note.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {note.user.starAchievement && (
                      <div className="absolute -top-1 -right-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-800 group-hover:text-blue-600">
                      {note.user.username}
                    </h3>
                    {note.user.starAchievement && (
                      <p className="text-sm text-yellow-600">
                        Yıldızlı Kullanıcı
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Notu Sil</h3>
            <p className="text-gray-600 mb-4">
              Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                disabled={deleteLoading}
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotePage;