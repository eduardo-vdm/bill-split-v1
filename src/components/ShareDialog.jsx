import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentTextIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Dialog from './Dialog';
import Button from './Button';

export default function ShareDialog({ isOpen, onClose, onShareAsText, onShareAsImage }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleShareAsImage = async () => {
    setIsLoading(true);
    try {
      await onShareAsImage();
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    {
      label: t('share:asText'),
      onClick: onShareAsText,
      variant: 'outline',
      icon: DocumentTextIcon
    },
    {
      label: isLoading ? t('share:capturing') : t('share:asImage'),
      onClick: handleShareAsImage,
      variant: 'outline',
      icon: PhotoIcon,
      disabled: isLoading
    },
    {
      label: t('common:buttons.cancel'),
      onClick: onClose,
      variant: 'outline',
      icon: XMarkIcon
    }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('share:title')}
      description={t('share:description')}
      actions={actions}
    />
  );
} 