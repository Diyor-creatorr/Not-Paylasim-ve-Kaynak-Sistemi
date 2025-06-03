import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotePage from './pages/NotePage';
import CreateNotePage from './pages/CreateNotePage';
import UserNotesPage from './pages/UserNotesPage';
import MyNotesPage from './pages/MyNotesPage';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import NotFound from './pages/NotFound';

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      {children}
    </main>
    <Footer />
  </div>
);

// Route yapılandırması
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><HomePage /></Layout>
  },
  {
    path: '/login',
    element: <Layout><LoginPage /></Layout>
  },
  {
    path: '/register',
    element: <Layout><RegisterPage /></Layout>
  },
  {
    path: '/notes/:id',
    element: <Layout><NotePage /></Layout>
  },
  {
    path: '/users/:id/notes',
    element: <Layout><UserNotesPage /></Layout>
  },
  {
    path: '/profile',
    element: <PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>
  },
  {
    path: '/notes/create',
    element: <PrivateRoute><Layout><CreateNotePage /></Layout></PrivateRoute>
  },
  {
    path: '/my-notes',
    element: <PrivateRoute><Layout><MyNotesPage /></Layout></PrivateRoute>
  },
  {
    path: '/chat',
    element: <PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>
  },
  {
    path: '/admin/*',
    element: <AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;