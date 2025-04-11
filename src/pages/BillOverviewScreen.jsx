import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import PersonAvatar from '../components/PersonAvatar';
import { billTypes } from '../utils/helpers';
import { formatCurrency } from '../utils/formatters';

export default function BillOverviewScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { bills, updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();

  useEffect(() => {
    const bill = bills.find(b => b.id === id);
    if (!bill) {
      navigate('/bills');
      return;
    }
    updateCurrentBill(bill);
  }, [id, bills, navigate, updateCurrentBill]);

  useEffect(() => {
    if (currentBill) {
      const total = calculateTotal();
      if (total !== currentBill.total) {
        const updatedBill = { ...currentBill, total };
        updateCurrentBill(updatedBill);
        updateBill(id, updatedBill);
      }
    }
  }, [currentBill?.items, currentBill?.specialItems]);

  if (!currentBill) return null;

  const { name, type, place, date, persons = [], items = [], specialItems = [] } = currentBill;
  const billType = billTypes.find((t) => t.id === type);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const specialItemsTotal = specialItems.reduce((sum, item) => {
      if (item.method === 'percentage') {
        return sum + (subtotal * item.value) / 100;
      }
      return sum + item.value;
    }, 0);
    return subtotal + specialItemsTotal;
  };

  return (
    <Layout title={name} showBack>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span role="img" aria-label={type}>
                {billType?.icon}
              </span>
              <span>{name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {place} • {new Date(date).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
              <Button
                variant="outline"
                size="sm"
                icon={UserPlusIcon}
                onClick={() => navigate(`/bills/${id}/add-person`)}
              >
                Add Person
              </Button>
            </CardHeader>
            <CardContent>
              {persons.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No people added yet
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {persons.map((person) => (
                    <PersonAvatar
                      key={person.id}
                      name={person.name}
                      icon={person.icon}
                      showName
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                icon={PlusIcon}
                onClick={() => navigate(`/bills/${id}/add-item`)}
              >
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No items added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span>{item.name}</span>
                      <span className="font-medium">
                        {formatCurrency(item.price, user.currency)}
                      </span>
                    </div>
                  ))}
                  {specialItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-gray-600 dark:text-gray-300"
                    >
                      <span>
                        {item.type === 'tax' ? 'Tax' : 'Tip'} (
                        {item.method === 'percentage'
                          ? `${item.value}%`
                          : formatCurrency(item.value, user.currency)}
                        )
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          item.method === 'percentage'
                            ? (calculateSubtotal() * item.value) / 100
                            : item.value,
                          user.currency
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {formatCurrency(calculateTotal(), user.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/bills/${id}/add-special`)}
          >
            Add Tax/Tip
          </Button>
          <Button
            disabled={persons.length === 0 || items.length === 0}
            onClick={() => navigate(`/bills/${id}/summary`)}
          >
            View Summary
          </Button>
        </div>
      </div>
    </Layout>
  );
} 