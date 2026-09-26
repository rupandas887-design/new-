import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

interface HeaderProps {
  isLandingPage?: boolean;
  showSidebarToggle?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isLandingPage = false,
  showSidebarToggle = false,
  isSidebarOpen = true,
  onToggleSidebar
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-black py-3 sm:py-4 md:py-6 sticky top-0 z-[100] border-b border-white/5 backdrop-blur-md bg-black/90">
      <div className="container mx-auto px-3 sm:px-6 md:px-10 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          {showSidebarToggle && (
            <button 
              onClick={onToggleSidebar}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-orange-600/20 text-gray-300 hover:text-white border border-white/10 hover:border-orange-500/30 transition-all active:scale-95 flex items-center gap-2 group"
              title={isSidebarOpen ? "Collapse Navigation (Hide Sidebar)" : "Expand Navigation (Show Sidebar)"}
              aria-label={isSidebarOpen ? "Collapse Navigation" : "Expand Navigation"}
            >
              <Menu size={18} className="text-[#FF6600] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider text-gray-300 group-hover:text-white">
                {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              </span>
            </button>
          )}

          <Link to="/" className="flex items-center">
            <span className="text-lg sm:text-xl md:text-3xl font-bold text-white font-cinzel tracking-tight">
              SSK <span className="text-[#FF6600]">PEOPLE</span>
            </span>
          </Link>
        </div>
        
        <div>
          {user ? (
            <button 
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="px-4 sm:px-6 md:px-8 py-2 md:py-2.5 bg-[#FF6600] text-white text-[9px] md:text-[10px] font-black uppercase rounded-[4px] tracking-widest hover:bg-[#e65c00] transition-colors active:scale-95 shadow-lg shadow-orange-600/20"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-4 sm:px-6 md:px-8 py-2 md:py-2.5 bg-[#FF6600] text-white text-[9px] md:text-[10px] font-black uppercase rounded-[4px] tracking-widest hover:bg-[#e65c00] transition-colors active:scale-95 shadow-lg shadow-orange-600/20"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;