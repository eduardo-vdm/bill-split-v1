import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import { generateBillSummary } from '../utils/helpers';
import { formatCurrency } from '../utils/formatters';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import PersonAvatar from '../components/PersonAvatar';
import ShareDialog from '../components/ShareDialog';
import { useTranslation } from 'react-i18next';
import { DocumentTextIcon, PhotoIcon, ShareIcon } from '@heroicons/react/24/outline';

export default function BillSummaryScreen() {
  const navigate = useNavigate();
  const { id:billId } = useParams();
  const { bills } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  const [summary, setSummary] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // If we have a currentBill, use it to generate the summary
    if (currentBill) {
      setSummary(generateBillSummary(currentBill));
      return;
    }

    // If we have a billId but no currentBill, try to find and set the bill
    if (billId) {
      // If bills are not loaded yet, try to load them
      if (bills.length === 0) {
        const storedBills = JSON.parse(localStorage.getItem('bills') || '[]');
        if (storedBills.length > 0) {
          const bill = storedBills.find(b => b.id === billId);
          if (bill) {
            updateCurrentBill(bill);
            setSummary(generateBillSummary(bill));
            return;
          }
        }
        // If we couldn't find the bill in localStorage, redirect
        navigate('/');
        return;
      }

      // If bills are loaded, try to find the bill
      const bill = bills.find(b => b.id === billId);
      if (bill) {
        updateCurrentBill(bill);
        setSummary(generateBillSummary(bill));
      } else {
        navigate('/');
      }
    }
  }, [billId, bills, navigate, updateCurrentBill, currentBill]);

  const handleShareAsText = () => {
    if (!summary) return;

    const bill = currentBill;
    if (!bill) return;

    const date = new Date(bill.date).toLocaleDateString(i18n.language);
    const currency = user.currency;
    const total = summary.total;

    let shareText = `${t('bills:summary.title')} - ${bill.name || t('bills:namePlaceholder')}\n`;
    if (bill.place) {
      shareText += `${t('bills:place')}: ${bill.place}\n`;
    }
    shareText += `${t('bills:date')}: ${date}\n`;

    const lines = [
      `\n${t('bills:summary.subtotal')}: ${formatCurrency(summary.subtotal, currency)}`,
      ...summary.specialItems.map(item => 
        `${item.type === 'tax' ? t('bills:summary.tax') : t('bills:summary.tip')} (${item.method === 'percentage'
          ? `${item.value}%`
          : formatCurrency(item.value, currency)}): ${formatCurrency(item.calculatedValue, currency)}`
      ),
      `${t('bills:summary.total')}: ${formatCurrency(summary.total, currency)}`,
      `\n${t('bills:summary.breakdown')}:`,
      ...summary.personDetails.map(person => {
        const lines = [
          `${person.name}${person.name === user.name ? ` (${t('person:you')})` : ''}: ${formatCurrency(person.total, currency)}`,
          ...person.items.map(item => `  ${item.name}: ${formatCurrency(item.amount, currency)}`),
          ...summary.specialItems.map(specialItem => {
            const share = specialItem.calculatedValue / summary.personDetails.length;
            return `  ${specialItem.type === 'tax' ? t('bills:summary.tax') : t('bills:summary.tip')}: ${formatCurrency(share, currency)}`;
          })
        ];
        return lines.join('\n');
      }),
    ];
    shareText += lines.join('\n');

    navigator.clipboard.writeText(shareText)
      .then(() => {
        setToastMessage(t('share:success.text'));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch(() => {
        setToastMessage(t('share:error.text'));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
    setShowShareDialog(false);
  };

  const handleShareAsImage = async () => {
    try {
      const element = document.querySelector('.bill-summary-content');
      if (!element) return;

      // Create a clone of the content
      const clone = element.cloneNode(true);
      
      // Apply temporary styles to the clone
      clone.style.width = '400px';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      
      // Get the computed background color from body
      const computedStyle = window.getComputedStyle(document.querySelector('body'));
      const backgroundColor = computedStyle.backgroundColor;
      
      // Apply the background color to the clone
      clone.style.backgroundColor = backgroundColor;

      // Add the clone to the document
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scrollY: -window.scrollY,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        width: 400
      });

      // Remove the clone
      document.body.removeChild(clone);

      canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item])
          .then(() => {
            setToastMessage(t('share:success.image'));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          })
          .catch(() => {
            setToastMessage(t('share:error.image'));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          });
      });
    } catch (error) {
      setToastMessage(t('share:error.image'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
    setShowShareDialog(false);
  };

  if (!summary) {
    return (
      <Layout title={t('bills:summary.title')} showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('bills:summary.title')} showBack>
      <div className="max-w-[28rem] min-w-[20rem] mx-auto">
        <div className="space-y-6 bill-summary-content">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{summary.name}</CardTitle>
                {summary.place && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {summary.place} • {new Date(summary.date).toLocaleDateString(i18n.language)}
                  </p>
                )}
              </div>
              {/* <Button
                variant="outline"
                size="sm"
                icon={ShareIcon}
                onClick={() => setShowShareDialog(true)}
              >
                {t('bills:summary.share')}
              </Button> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span>{t('bills:summary.subtotal')}</span>
                  <span>{formatCurrency(summary.subtotal, user.currency)}</span>
                </div>

                {summary.specialItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center text-gray-600 dark:text-gray-300"
                  >
                    <span>
                      {item.type === 'tax' ? t('bills:summary.tax') : t('bills:summary.tip')} ({item.method === 'percentage'
                        ? `${item.value}%`
                        : formatCurrency(item.value, user.currency)})
                    </span>
                    <span>
                      {formatCurrency(item.calculatedValue, user.currency)}
                    </span>
                  </motion.div>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>{t('bills:summary.total')}</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      {formatCurrency(summary.total, user.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 pb-32">
            <h2 className="text-lg font-semibold">{t('bills:summary.breakdown')}</h2>
            {summary.personDetails.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <PersonAvatar
                        name={person.name}
                        icon={person.icon}
                        showName={false}
                      />
                      <div>
                        <CardTitle>
                          {person.name}
                          {person.name === user.name && (
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              ({t('person:you')})
                            </span>
                          )}
                        </CardTitle>
                        <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          {formatCurrency(person.total, user.currency)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {person.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.name}
                          </span>
                          <span>
                            {formatCurrency(item.amount, user.currency)}
                          </span>
                        </div>
                      ))}
                      {summary.specialItems.map((specialItem) => {
                        const share = specialItem.calculatedValue / summary.personDetails.length;
                        return (
                          <div
                            key={specialItem.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600 dark:text-gray-300">
                              {specialItem.type === 'tax' ? t('bills:summary.tax') : t('bills:summary.tip')} ({specialItem.method === 'percentage'
                                ? `${specialItem.value}%`
                                : formatCurrency(specialItem.value, user.currency)})
                            </span>
                            <span>
                              {formatCurrency(share, user.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Share footer with buttons */}
          <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto fixed bottom-0 left-0 right-0 py-2 px-4 bg-gray-100 dark:bg-gray-900 border-t-2 border-solid border-t-gray-500">
            <div className="flex items-center gap-2">
              <ShareIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-md text-gray-800 dark:text-gray-200">{t('common:share:copyAndShareAnywhere')}:</span>
            </div>
            <div className="flex items-center justify-around gap-2">
              <button
                onClick={() => handleShareAsText()}
                className="py-2 px-0 font-bold text-lg bg-primary-600 dark:bg-primary-600 text-white hover:bg-secondary-700 dark:hover:bg-secondary-700 border-t-4 border-solid border-t-secondary-500" 
              >
                <div className="flex gap-2 px-4 items-center justify-center whitespace-nowrap">
                  <span className="text-sm text-gray-300">
                    <DocumentTextIcon className="h-5 w-5 text-gray-300" />
                  </span>
                  <span className="text-lg font-bold">
                  {t('common:buttons.copyAsText')}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleShareAsImage()}
                className="py-2 px-4 font-bold text-lg bg-primary-600 dark:bg-primary-600 text-white hover:bg-secondary-700 dark:hover:bg-secondary-700 border-t-4 border-solid border-t-secondary-500" 
              >
                <div className="flex gap-2 px-0 items-center justify-center whitespace-nowrap">
                  <span className="text-sm text-gray-300">
                    <PhotoIcon className="h-5 w-5 text-gray-300" />
                  </span>
                  <span className="text-lg font-bold">
                    {t('common:buttons.copyAsImage')}
                  </span>
                </div>
              </button>
            </div>
          </div>

        </div>

        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShareAsText={handleShareAsText}
          onShareAsImage={handleShareAsImage}
        />

        {showToast && (
          <AnimatePresence>
            <motion.div
              key={toastMessage}
              transition={{ duration: 0.2 }}            
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { delay: 3, duration: 0.5 } }}
              className="fixed bottom-28 left-1/2 transform -translate-x-1/2 bg-green-800 text-white px-4 py-2 rounded"
            >
              {toastMessage}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
} 