import { forwardRef } from 'react';
import { classNames } from '../utils/helpers';

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      className = '',
      containerClassName = '',
      labelClassName = '',
      helpText,
      ...props
    },
    ref
  ) => {
    return (
      <div className={classNames('space-y-1', containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className={classNames(
              'block text-sm font-medium text-gray-700 dark:text-gray-300',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={classNames(
            'input',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-800'
              : '',
            className
          )}
          {...props}
        />
        {helpText && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 