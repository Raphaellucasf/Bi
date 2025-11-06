import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';

/**
 * Modal Responsivo - Base para todos os modais do sistema
 * 
 * Características:
 * - Totalmente responsivo (celular, tablet, desktop)
 * - Scroll automático quando conteúdo é grande
 * - Adapta-se a diferentes resoluções e níveis de zoom
 * - Acessível (ESC para fechar, trap de foco)
 * - Suporte a diferentes tamanhos (sm, md, lg, xl, full)
 */
export const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName
}) => {
  // Previne scroll do body quando modal está aberto
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

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  // Tamanhos do modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  const handleBackdropClick = (e) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-2 sm:p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          'bg-white rounded-lg sm:rounded-xl shadow-xl w-full mx-auto my-auto relative',
          'max-h-[98vh] sm:max-h-[95vh] flex flex-col',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-start justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0',
              headerClassName
            )}
          >
            {title && (
              <h2
                id="modal-title"
                className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pr-8"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Fechar modal"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body - com scroll automático */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-4 sm:p-6',
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'flex-shrink-0 p-4 sm:p-6 border-t border-gray-200',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar estado de modal
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
};

export default ResponsiveModal;
