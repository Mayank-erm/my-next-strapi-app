// utils/ModalPortal.tsx - Create this file to ensure modals render at body level
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // Create portal at body level to escape any container constraints
  return createPortal(children, document.body);
};

export default ModalPortal;