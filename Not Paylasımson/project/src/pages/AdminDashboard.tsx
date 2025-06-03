import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Users, FileText, Settings } from 'lucide-react';
import AdminUsers from './admin/AdminUsers';
import AdminNotes from './admin/AdminNotes';
import AdminSettings from './admin/AdminSettings';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Toggle (Mobile) */}
        <div className="md:hidden p-4 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium">Admin Paneli</span>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${sidebarOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-gray-50 p-4 md:border-r border-gray-200`}
        >
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="ml-2 text-xl font-bold text-gray-800">Admin Paneli</h2>
          </div>
          
          <nav className="space-y-1">
            <Link
              to="/admin/users"
              className={`flex items-center px-4 py-3 rounded-md ${
                isActive('/admin/users')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Users className="h-5 w-5 mr-3" />
              <span>Kullanıcılar</span>
            </Link>
            
            <Link
              to="/admin/notes"
              className={`flex items-center px-4 py-3 rounded-md ${
                isActive('/admin/notes')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <FileText className="h-5 w-5 mr-3" />
              <span>Notlar</span>
            </Link>
            
            <Link
              to="/admin/settings"
              className={`flex items-center px-4 py-3 rounded-md ${
                isActive('/admin/settings')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Ayarlar</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          <Routes>
            <Route path="/" element={<AdminUsers />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/notes" element={<AdminNotes />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;