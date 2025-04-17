import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Dialog from '../components/Dialog';
import { generateId } from '../utils/helpers';
import { formatCurrency } from '../utils/formatters';
import { ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const specialItemTypes = [
  { id: 'tax', translationKey: 'bills:taxTip.type.tax' },
  { id: 'tip', translationKey: 'bills:taxTip.type.tip' },
];

const methods = [
  { id: 'percentage', translationKey: 'bills:taxTip.method.percentage' },
  { id: 'fixed', translationKey: 'bills:taxTip.method.fixed' },
];

export default function AddSpecialItemScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  const { t } = useTranslation();
  const [showNoItemsDialog, setShowNoItemsDialog] = useState(false);

  const editSpecialItem = location.state?.editSpecialItem;
  const isEditing = !!editSpecialItem;

  const [formData, setFormData] = useState({
    type: specialItemTypes[0],
    method: methods[0],
    value: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editSpecialItem) {
      setFormData({
        type: specialItemTypes.find(t => t.id === editSpecialItem.type) || specialItemTypes[0],
        method: methods.find(m => m.id === editSpecialItem.method) || methods[0],
        value: editSpecialItem.value.toString(),
      });
    }
  }, [editSpecialItem]);

  useEffect(() => {
    if (currentBill && currentBill.items.length === 0 && !isEditing) {
      setShowNoItemsDialog(true);
    }
  }, [currentBill, isEditing]);

  const calculateSubtotal = () => {
    return currentBill.items.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valid value is required';
    }

    if (formData.method.id === 'percentage' && parseFloat(formData.value) > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const specialItemData = {
      id: editSpecialItem ? editSpecialItem.id : generateId('special-'),
      type: formData.type.id,
      method: formData.method.id,
      value: parseFloat(formData.value),
    };

    const updatedBill = {
      ...currentBill,
      specialItems: editSpecialItem
        ? currentBill.specialItems.map(item =>
            item.id === editSpecialItem.id ? specialItemData : item
          )
        : [...(currentBill.specialItems || []), specialItemData],
    };

    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
    navigate(`/bills/${id}`);
  };

  const subtotal = calculateSubtotal();
  const calculatedValue =
    formData.method.id === 'percentage' && formData.value
      ? (subtotal * parseFloat(formData.value)) / 100
      : parseFloat(formData.value) || 0;

  return (
    <Layout title={isEditing ? t('bills:editSpecialItem') : t('bills:addSpecialItem')} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('bills:specialItemType')}
            </label>
            <select
              id="type"
              value={formData.type.id}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: specialItemTypes.find(t => t.id === e.target.value) }))}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              {specialItemTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {t(type.translationKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('bills:selectSpecialItemType')}
            </label>
            <select
              id="method"
              value={formData.method.id}
              onChange={(e) => setFormData((prev) => ({ ...prev, method: methods.find(m => m.id === e.target.value) }))}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              {methods.map((method) => (
                <option key={method.id} value={method.id}>
                  {t(method.translationKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {formData.method.id === 'percentage' ? t('bills:taxTip.percentage') : t('bills:taxTip.amount')}
            </label>
            <input
              type="number"
              id="value"
              step={formData.method.id === 'percentage' ? '1' : '0.01'}
              value={formData.value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, value: e.target.value }))
              }
              placeholder={
                formData.method.id === 'percentage'
                  ? t('bills:taxTip.percentagePlaceholder')
                  : t('bills:taxTip.amountPlaceholder', { currency: user.currency })
              }
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
            />
          </div>

          {formData.value && (
            <div className="text-sm text-gray-500">
              {t('bills:taxTip.calculatedAmount')}:{' '}
              <span className="font-medium">
                {formatCurrency(calculatedValue, user.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/bills/${id}`)}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit">
              {isEditing ? t('common:buttons.update') : t('common:buttons.add')} {t(formData.type.translationKey)}
            </Button>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showNoItemsDialog}
        onClose={() => {
          setShowNoItemsDialog(false);
          navigate(`/bills/${id}`);
        }}
        title={t('bills:noItemsTitle')}
        description={t('bills:noItemsDescription')}
        icon={<ShoppingBagIcon className="h-12 w-12 text-blue-500" />}
        actions={[
          {
            label: t('common:buttons.backToBill'),
            onClick: () => {
              setShowNoItemsDialog(false);
              navigate(`/bills/${id}`);
            },
            variant: 'outline',
            icon: ArrowLeftIcon
          },
          {
            label: t('common:buttons.addItem'),
            onClick: () => {
              setShowNoItemsDialog(false);
              navigate(`/bills/${id}/add-item`);
            },
            icon: ShoppingBagIcon
          }
        ]}
      />
    </Layout>
  );
} 