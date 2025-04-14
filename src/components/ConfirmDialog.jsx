import { useState } from 'react';
import Dialog from './Dialog';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger'
}) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={typeof title === 'string' ? t(title) : title}
      description={typeof description === 'string' ? t(description) : description}
      icon={<ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />}
      actions={[
        {
          label: typeof cancelText === 'string' ? t(cancelText) : cancelText || t('common:buttons.cancel'),
          onClick: onClose,
          variant: 'outline'
        },
        {
          label: typeof confirmText === 'string' ? t(confirmText) : confirmText || t('common:buttons.confirm'),
          onClick: handleConfirm,
          variant
        }
      ]}
    />
  );
} 