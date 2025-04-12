import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../utils/helpers';

export default function Select({
  label,
  options,
  value,
  onChange,
  error,
  displayValue,
  containerClassName = '',
  labelClassName = '',
  helpText,
  disabled = false,
}) {
  return (
    <div className={containerClassName}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <>
            {label && (
              <Listbox.Label
                className={classNames(
                  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
                  labelClassName
                )}
              >
                {label}
              </Listbox.Label>
            )}
            <div className="relative">
              <Listbox.Button
                className={classNames(
                  'relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border focus:outline-none focus:ring-2 sm:text-sm',
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-800'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 dark:border-gray-600 dark:focus:border-primary-400 dark:focus:ring-primary-800',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="block truncate">
                  {displayValue ? displayValue(value) : value?.name || 'Select...'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option, optionIdx) => (
                    <Listbox.Option
                      key={optionIdx}
                      className={({ active }) =>
                        classNames(
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                          active
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                            : 'text-gray-900 dark:text-gray-100'
                        )
                      }
                      value={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            {option.icon && (
                              <span className="mr-2 text-lg">{option.icon}</span>
                            )}
                            <span
                              className={classNames(
                                'block truncate',
                                selected ? 'font-semibold' : 'font-normal'
                              )}
                            >
                              {option.name}
                            </span>
                          </div>

                          {selected && (
                            <span
                              className={classNames(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                active
                                  ? 'text-primary-900 dark:text-primary-100'
                                  : 'text-primary-600 dark:text-primary-400'
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
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