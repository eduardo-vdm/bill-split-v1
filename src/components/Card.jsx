import { motion } from 'framer-motion';
import { classNames } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

export default function Card({
  children,
  className = '',
  onClick,
  animate = true,
  ...props
}) {
  const Component = animate ? motion.div : 'div';

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={classNames(
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6',
        onClick && 'cursor-pointer hover:shadow-xl transition-shadow duration-200',
        className
      )}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={classNames('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  const { t } = useTranslation();
  return (
    <h3
      className={classNames(
        'text-lg font-semibold text-gray-900 dark:text-white',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? t(children) : children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  const { t } = useTranslation();
  return (
    <p
      className={classNames(
        'text-sm text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? t(children) : children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={classNames('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={classNames(
        'flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 