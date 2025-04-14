import React, { forwardRef } from 'react';
import { classNames } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const Select = forwardRef(
  (
    {
      label,
      name,
      options,
      value,
      onChange,
      error,
      className = '',
      labelClassName = '',
      selectClassName = '',
      errorClassName = '',
      required = false,
      placeholder,
      displayValue,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();

    const handleChange = (e) => {
      const selectedOption = options.find(opt => opt.id === e.target.value);
      onChange(selectedOption);
    };

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
        <select
          ref={ref}
          name={name}
          id={name}
          value={value?.id || ''}
          onChange={handleChange}
          className={classNames(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            selectClassName
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {typeof placeholder === 'string' ? t(placeholder) : placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {displayValue ? displayValue(option) : t(option.translationKey)}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export default Select; 