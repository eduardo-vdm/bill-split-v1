import React, { forwardRef } from 'react';
import { classNames } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      error,
      className = '',
      labelClassName = '',
      inputClassName = '',
      errorClassName = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={name}
            className={classNames(
              'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
              labelClassName
            )}
          >
            {typeof label === 'string' ? t(label) : label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          id={name}
          placeholder={typeof placeholder === 'string' ? t(placeholder) : placeholder}
          className={classNames(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            inputClassName
          )}
          {...props}
        />
        {error && (
          <p
            className={classNames(
              'mt-1 text-sm text-red-600 dark:text-red-400',
              errorClassName
            )}
          >
            {typeof error === 'string' ? t(error) : error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 