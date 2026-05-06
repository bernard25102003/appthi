import { useState } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Orders } from './pages/Orders';
import { Reviews } from './pages/Reviews';
import { Users } from './pages/Users';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'orders':
        return <Orders />;
      case 'reviews':
        return <Reviews />;
      case 'users':
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}