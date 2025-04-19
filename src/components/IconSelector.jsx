import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { personIcons } from '../utils/helpers';

export default function IconSelector({ value, onChange, disabled }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(value || personIcons[0]);
  const containerRef = useRef(null);

  useEffect(() => {
    setSelectedIcon(value || personIcons[0]);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    onChange(icon);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-5/6 p-2 border rounded-lg flex flex-col items-center justify-between
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400'
          }`}
      >
        <span className="flex-1 flex items-center justify-center w-full">
          <span className="text-4xl leading-none">{selectedIcon}</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-full top-0 mr-2 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-primary-500 dark:border-primary-400 p-4 min-w-fit"
          >
            <div className="grid grid-cols-4 gap-3" style={{ width: 'max-content' }}>
              {personIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg transition-colors
                    ${selectedIcon === icon
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 border-2 border-primary-500 dark:border-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-400 border border-gray-300 dark:border-gray-600'
                    }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 