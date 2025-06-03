import React, { useState } from 'react';
import axios from 'axios';
import { Settings, Save, AlertCircle } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [notesPerPage, setNotesPerPage] = useState('10');
  const [maxFileSize, setMaxFileSize] = useState('50');
  const [allowedFileTypes, setAllowedFileTypes] = useState(['pdf', 'image', 'document', 'other']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle checkbox changes for allowed file types
  const handleFileTypeChange = (type: string) => {
    if (allowedFileTypes.includes(type)) {
      setAllowedFileTypes(allowedFileTypes.filter(t => t !== type));
    } else {
      setAllowedFileTypes([...allowedFileTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would make an API request here
      // This is a placeholder for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistem Ayarları</h1>
        <p className="text-gray-600 mt-1">Not paylaşım sisteminin genel ayarlarını yapılandırın</p>
      </div>

      {(error || success) && (
        <div className={`mb-6 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} p-4 rounded-lg flex items-start`}>
          {error ? (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <Save className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          )}
          <p>{error || 'Ayarlar başarıyla kaydedildi.'}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Genel Ayarlar</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="notesPerPage" className="block text-sm font-medium text-gray-700 mb-1">
                  Sayfa Başına Not Sayısı
                </label>
                <input
                  id="notesPerPage"
                  type="number"
                  min="5"
                  max="50"
                  value={notesPerPage}
                  onChange={(e) => setNotesPerPage(e.target.value)}
                  className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Listelerde gösterilecek not sayısı
                </p>
              </div>
              
              <div>
                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Maksimum Dosya Boyutu (MB)
                </label>
                <input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Yüklenebilecek maksimum dosya boyutu (MB cinsinden)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İzin Verilen Dosya Türleri
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="filetype-pdf"
                      type="checkbox"
                      checked={allowedFileTypes.includes('pdf')}
                      onChange={() => handleFileTypeChange('pdf')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="filetype-pdf" className="ml-2 block text-sm text-gray-700">
                      PDF Dosyaları
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="filetype-image"
                      type="checkbox"
                      checked={allowedFileTypes.includes('image')}
                      onChange={() => handleFileTypeChange('image')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="filetype-image" className="ml-2 block text-sm text-gray-700">
                      Resim Dosyaları (JPG, PNG, GIF)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="filetype-document"
                      type="checkbox"
                      checked={allowedFileTypes.includes('document')}
                      onChange={() => handleFileTypeChange('document')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="filetype-document" className="ml-2 block text-sm text-gray-700">
                      Belge Dosyaları (DOC, DOCX, XLS, XLSX, PPT, PPTX)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="filetype-other"
                      type="checkbox"
                      checked={allowedFileTypes.includes('other')}
                      onChange={() => handleFileTypeChange('other')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="filetype-other" className="ml-2 block text-sm text-gray-700">
                      Diğer Dosya Türleri
                    </label>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  En az bir dosya türü seçilmelidir
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Kullanıcı Ayarları</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="starThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Yıldız Rozeti için Not Eşiği
                </label>
                <input
                  id="starThreshold"
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="10"
                  className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Kullanıcının yıldız rozeti kazanması için gereken minimum not sayısı
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex justify-end">
            <button
              type="submit"
              disabled={loading || allowedFileTypes.length === 0}
              className={`px-4 py-2 rounded-md shadow-sm text-white font-medium flex items-center ${
                loading || allowedFileTypes.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Ayarları Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;