import { useTranslation } from 'react-i18next';
import { ScaleIcon, CalculatorIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const splitMethods = [
  {
    id: 'equal',
    name: 'split.equal',
    icon: ScaleIcon,
    description: 'split.equalDescription'
  },
  {
    id: 'percentage',
    name: 'split.percentage',
    icon: CalculatorIcon,
    description: 'split.percentageDescription'
  },
  {
    id: 'value',
    name: 'split.value',
    icon: ChartBarIcon,
    description: 'split.valueDescription'
  }
];

export default function SplitMethodSelector({ value, onChange, className = '' }) {
  const { t } = useTranslation();

  return (
    <div className={`grid grid-cols-1 gap-3 ${className}`}>
      {splitMethods.map((method) => {
        const Icon = method.icon;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
              value === method.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="h-6 w-6 text-primary-500" />
            <div className="text-left">
              <div className="font-medium">{t(method.name)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t(method.description)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
} 