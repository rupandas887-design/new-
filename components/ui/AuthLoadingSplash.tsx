import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

const AuthLoadingSplash: React.FC = () => {
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBypass(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBypass = () => {
    try {
      localStorage.removeItem('ssk_last_authenticated_route');
    } catch (e) {
      // ignore
    }
    window.location.hash = '#/';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-96 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 via-saffron-400/10 to-saffron-500/10 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
        <BrandLogo variant="light" size="lg" showSubtitle={true} />
        
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-saffron-100 shadow-sm text-saffron-600 text-xs font-semibold">
          <Loader2 size={16} className="animate-spin text-saffron-600" />
          <span>Restoring verified session...</span>
        </div>

        {showBypass && (
          <div className="pt-2 animate-in fade-in duration-300">
            <button
              onClick={handleBypass}
              className="text-xs text-saffron-600 hover:text-saffron-800 underline font-semibold transition-colors"
            >
              Taking longer than expected? Click here to continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLoadingSplash;

