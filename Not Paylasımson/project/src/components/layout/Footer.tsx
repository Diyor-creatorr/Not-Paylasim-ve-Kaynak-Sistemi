import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">NotePaylasim</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Eğitim kaynaklarını paylaşın, bilgiyi çoğaltın. NotePaylasim, öğrenciler ve
              eğitimciler için oluşturulmuş bir not ve kaynak paylaşım platformudur.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/notes/create" className="text-gray-300 hover:text-white transition-colors">
                  Not Yükle
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <div className="space-y-2">
              <a href="mailto:info@notepaylasim.com" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
                <span>diyorjonochilov@stu.topkapi.edu.tr</span>
              </a>
              <a href="https://github.com/Diyor-creatorr" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} NotePaylasim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;