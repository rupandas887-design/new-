import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = 'lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0B0D0F]/80 backdrop-blur-md flex items-center justify-center z-[200] p-0 sm:p-4 animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className={`w-full ${widthClasses[maxWidth]} h-full sm:h-auto sm:max-h-[90vh] animate-in zoom-in-95 duration-200 relative mx-auto flex flex-col bg-[#111417] sm:rounded-2xl border border-[#292E35] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#292E35] bg-[#111417] z-30 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight leading-tight pr-4">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="text-[#737B87] hover:text-[#F8FAFC] transition-all p-2 hover:bg-[#171A1F] rounded-xl active:scale-95 border border-transparent hover:border-[#292E35]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Independently Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto custom-scrollbar p-6 overscroll-contain relative bg-[#111417] text-[#F8FAFC] touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="min-h-full">
            {children}
          </div>
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="shrink-0 border-t border-[#292E35] p-5 sm:px-6 bg-[#171A1F] z-30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
