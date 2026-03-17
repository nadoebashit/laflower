import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, History, BarChart2, LogOut, Menu, X, Users } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Склад', path: '/inventory', icon: Package },
    { name: 'Продажа', path: '/sale', icon: ShoppingCart },
    { name: 'История', path: '/history', icon: History, role: 'admin' },
    { name: 'Отчеты', path: '/reports', icon: BarChart2, role: 'admin' },
    { name: 'Сотрудники', path: '/employees', icon: Users, role: 'admin' },
  ].filter(l => !l.role || user.role === l.role);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-surface-50 text-surface-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-surface-200 flex flex-col shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent flex justify-center items-center">
             🌺 LaFlower
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-surface-500 hover:text-surface-900 p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-brand-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-brand-600' : 'text-surface-400'} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-surface-200">
           <div className="flex flex-col mb-4 px-2">
             <span className="text-sm font-medium text-surface-800 truncate">{user.email}</span>
             <span className="text-xs text-brand-600 uppercase tracking-wider font-semibold">{user.role}</span>
           </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-surface-200 p-4 flex items-center justify-between md:hidden shadow-sm z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-surface-600 hover:text-brand-600 rounded-lg hover:bg-surface-50 transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent flex-1 text-center pr-8">
             🌺 LaFlower
          </h1>
        </header>

        <main className="flex-1 overflow-auto bg-surface-50 relative">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
