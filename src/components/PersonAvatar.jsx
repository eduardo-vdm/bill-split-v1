import { classNames } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

export default function PersonAvatar({
  name,
  icon,
  size = 'md',
  showName = true,
  selected = false,
  onClick,
  className = '',
  ...props
}) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'h-8 w-8 text-lg',
    md: 'h-10 w-10 text-xl',
    lg: 'h-12 w-12 text-2xl',
  };

  const nameSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className={classNames(
        'flex flex-col items-center',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div
        className={classNames(
          'flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800',
          selected && 'ring-2 ring-primary-500 dark:ring-primary-400',
          sizeClasses[size]
        )}
      >
        <span role="img" aria-label={t('person:icon')}>
          {icon}
        </span>
      </div>
      {showName && (
        <span
          className={classNames(
            'mt-1 font-medium text-gray-900 dark:text-white truncate',
            nameSizeClasses[size]
          )}
        >
          {typeof name === 'string' ? t(name) : name}
        </span>
      )}
    </div>
  );
}

export function PersonAvatarGroup({
  persons,
  max = 5,
  size = 'md',
  showName = false,
  onMoreClick,
  className = '',
  ...props
}) {
  const { t } = useTranslation();

  const visiblePersons = persons.slice(0, max);
  const remainingCount = persons.length - max;

  const sizeClasses = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div
      className={classNames('flex items-center', className)}
      {...props}
    >
      {visiblePersons.map((person, index) => (
        <div
          key={person.id}
          className={classNames(
            'relative',
            index > 0 && sizeClasses[size]
          )}
          style={{ zIndex: visiblePersons.length - index }}
        >
          <PersonAvatar
            name={person.name}
            icon={person.icon}
            size={size}
            showName={showName}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <button
          onClick={onMoreClick}
          className={classNames(
            'flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
            sizeClasses[size],
            size === 'sm' ? 'h-8 w-8 text-sm' : size === 'lg' ? 'h-12 w-12 text-lg' : 'h-10 w-10 text-base'
          )}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
} 