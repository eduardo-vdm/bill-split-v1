import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import { generateBillSummary } from '../utils/helpers';
import { formatCurrency } from '../utils/formatters';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import PersonAvatar from '../components/PersonAvatar';

export default function BillSummaryScreen() {
  const navigate = useNavigate();
  const { id:billId } = useParams();
  const { bills } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { currency, user } = useUserContext();
  const [summary, setSummary] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);

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

  const handleShare = () => {
    if (!summary) return;

    const bill = currentBill;
    if (!bill) return;

    const date = new Date(bill.date).toLocaleDateString();
    const currency = user.currency;
    const total = summary.total;

    let shareText = `Bill Summary - ${bill.name || 'Unnamed Bill'}\n`;
    if (bill.place) {
      shareText += `Place: ${bill.place}\n`;
    }
    shareText += `Date: ${date}\n\n`;

    const lines = [
      `${summary.name} - Bill Summary`,
      summary.place ? `${summary.place} • ${summary.date}` : summary.date,
      `\nSubtotal: ${formatCurrency(summary.subtotal, currency)}`,
      ...summary.specialItems.map(item => 
        `${item.type === 'tax' ? 'Tax' : 'Tip'} (${item.method === 'percentage'
          ? `${item.value}%`
          : formatCurrency(item.value, currency)}): ${formatCurrency(item.calculatedValue, currency)}`
      ),
      `Total: ${formatCurrency(summary.total, currency)}`,
      '\nBreakdown per person:',
      ...summary.personDetails.map(person => {
        const lines = [
          `${person.name}: ${formatCurrency(person.total, currency)}`,
          ...person.items.map(item => `  ${item.name}: ${formatCurrency(item.amount, currency)}`),
          ...summary.specialItems.map(specialItem => {
            const share = specialItem.calculatedValue / summary.personDetails.length;
            return `  ${specialItem.type === 'tax' ? 'Tax' : 'Tip'}: ${formatCurrency(share, currency)}`;
          })
        ];
        return lines.join('\n');
      }),
    ];
    shareText += lines.join('\n');

    navigator.clipboard.writeText(shareText);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  if (!summary) {
    return (
      <Layout title="Bill Summary" showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Bill Summary" showBack>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{summary.name}</CardTitle>
              {summary.place && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {summary.place} • {summary.date}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ShareIcon}
              onClick={handleShare}
            >
              Share
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span>Subtotal</span>
                <span>{formatCurrency(summary.subtotal, currency)}</span>
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
                    {item.type === 'tax' ? 'Tax' : 'Tip'} ({item.method === 'percentage'
                      ? `${item.value}%`
                      : formatCurrency(item.value, currency)})
                  </span>
                  <span>
                    {formatCurrency(item.calculatedValue, currency)}
                  </span>
                </motion.div>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-xl font-semibold">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatCurrency(summary.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {summary.personDetails.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
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
                      <CardTitle>{person.name}</CardTitle>
                      <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(person.total, currency)}
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
                          {formatCurrency(item.amount, currency)}
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
                            {specialItem.type === 'tax' ? 'Tax' : 'Tip'} ({specialItem.method === 'percentage'
                              ? `${specialItem.value}%`
                              : formatCurrency(specialItem.value, currency)})
                          </span>
                          <span>
                            {formatCurrency(share, currency)}
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
      </div>

      {showShareToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full"
        >
          Bill summary copied to clipboard!
        </motion.div>
      )}
    </Layout>
  );
} 