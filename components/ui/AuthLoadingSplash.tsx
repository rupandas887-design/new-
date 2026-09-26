import React from 'react';
import { Globe, Loader2 } from 'lucide-react';

const AuthLoadingSplash: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative selection:bg-orange-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-orange-600/10 blur-[150px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-in">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-500">
          <Globe size={14} className="animate-spin-slow" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">SSK Global Network</span>
        </div>
        
        <h1 className="font-cinzel text-3xl sm:text-4xl text-white tracking-tight uppercase">
          SSK <span className="text-orange-600">SECURE</span>
        </h1>
        
        <div className="flex items-center gap-3 text-orange-500 text-xs font-black uppercase tracking-[0.3em] pt-2">
          <Loader2 size={18} className="animate-spin" />
          <span>Restoring Secure Session...</span>
        </div>
        
        <p className="text-gray-600 text-[9px] tracking-[0.4em] uppercase font-black">
          Identity Verification Terminal
        </p>
      </div>
    </div>
  );
};

export default AuthLoadingSplash;
