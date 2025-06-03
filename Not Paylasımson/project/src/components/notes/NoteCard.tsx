import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image, File, Download, Eye, Calendar, Star } from 'lucide-react';

interface NoteCardProps {
  note: {
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
  };
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  // Function to get file icon based on file type
  const getFileIcon = () => {
    switch (note.fileType) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'image':
        return <Image className="h-10 w-10 text-green-500" />;
      case 'document':
        return <FileText className="h-10 w-10 text-blue-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  // Format date
  const formattedDate = new Date(note.createdAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/notes/${note._id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                {note.title}
              </h3>
            </Link>
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">{note.description}</p>
          </div>
          <div className="ml-4">{getFileIcon()}</div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Link to={`/users/${note.user._id}/notes`} className="flex items-center hover:underline">
              <div className="relative">
                {note.user.profilePicture ? (
                  <img
                    src={note.user.profilePicture}
                    alt={note.user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {note.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {note.user.starAchievement && (
                  <div className="absolute -top-1 -right-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                )}
              </div>
              <span className="ml-2 text-sm text-gray-700">{note.user.username}</span>
            </Link>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{note.views}</span>
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                <span>{note.downloads}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;