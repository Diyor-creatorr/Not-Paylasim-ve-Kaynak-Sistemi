import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <FileQuestion className="h-24 w-24 text-blue-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
      <p className="text-lg text-gray-600 mb-8">
        Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;