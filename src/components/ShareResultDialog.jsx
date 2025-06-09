import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from './Dialog';
import { DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function ShareResultDialog({ isOpen, onClose, shareMode, onShareAsText, onShareAsImage }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const copyContentToClipboard = async (mode, content) => {
    await navigator.clipboard.writeText(content);
  };

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
      label: t('common:buttons.shareAsText'),
      onClick: onShareAsText,
      variant: 'outline',
      icon: DocumentTextIcon
    },
    {
      label: isLoading ? t('common:buttons.capturing') : t('common:buttons.shareAsImage'),
      onClick: handleShareAsImage,
      variant: 'outline',
      icon: PhotoIcon,
      disabled: isLoading
    }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('common:buttons.share')}
      description={t('common:buttons.shareAsText')}
      actions={actions}
    >
      <div className="flex flex-col items-center justify-center">
        lalalalalalalala
      </div>
    </Dialog>
  );
} 