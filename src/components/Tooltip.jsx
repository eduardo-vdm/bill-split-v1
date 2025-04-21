import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ 
  children, 
  content, 
  position = 'bottom',
  className = '',
  showOnTouch = true,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const handleTouchStart = () => {
    if (!showOnTouch) return;
    
    // Clear any existing timeout
    if (touchTimeout) {
      clearTimeout(touchTimeout);
    }
    
    setIsVisible(true);
    
    // Set a new timeout to hide the tooltip after 1.5 seconds
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
    
    setTouchTimeout(timeout);
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  const arrowClasses = {
    top: 'bottom-[-6px] border-t-gray-800 dark:border-t-gray-700 rotate-180',
    bottom: 'top-[-6px] border-b-gray-800 dark:border-b-gray-700',
    left: 'right-[-6px] border-l-gray-800 dark:border-l-gray-700 rotate-90',
    right: 'left-[-6px] border-r-gray-800 dark:border-r-gray-700 -rotate-90'
  };

  return (
    <div 
      ref={tooltipRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`
              absolute z-50 whitespace-nowrap
              ${positionClasses[position]}
            `}
            style={{ 
              transformOrigin: position === 'top' ? 'bottom' : 
                             position === 'bottom' ? 'top' : 
                             position === 'left' ? 'right' : 'left' 
            }}
          >
            <div className="relative">
              <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg py-1 px-2 shadow-lg">
                {content}
              </div>
              <div 
                className={`
                  absolute w-0 h-0
                  border-[6px] border-transparent
                  ${arrowClasses[position]}
                `}
                style={{
                  left: position === 'top' || position === 'bottom' ? '50%' : undefined,
                  top: position === 'left' || position === 'right' ? '50%' : undefined,
                  transform: `${
                    (position === 'top' || position === 'bottom') ? 'translateX(-50%)' :
                    (position === 'left' || position === 'right') ? 'translateY(-50%)' : ''
                  }`
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 