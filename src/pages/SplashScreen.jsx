import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user exists after a delay
    const timer = setTimeout(() => {
      if (user.name) {
        navigate('/bills');
      } else {
        navigate('/setup');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user.name, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {t('app:splash.title')}
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl text-white opacity-90"
        >
          {t('app:splash.subtitle')}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-white text-lg"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </motion.div>
    </div>
  );
} 