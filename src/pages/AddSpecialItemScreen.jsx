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

const specialItemTypes = [
  { id: 'tax', name: 'Tax' },
  { id: 'tip', name: 'Tip' },
];

const methods = [
  { id: 'percentage', name: 'Percentage' },
  { id: 'fixed', name: 'Fixed Amount' },
];

export default function AddSpecialItemScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
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
    <Layout title={isEditing ? `Edit ${formData.type.name}` : `Add ${formData.type.name}`} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Type"
            options={specialItemTypes}
            value={formData.type}
            onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
            displayValue={(selected) => selected.name}
          />

          <Select
            label="Method"
            options={methods}
            value={formData.method}
            onChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
            displayValue={(selected) => selected.name}
          />

          <Input
            label={formData.method.id === 'percentage' ? 'Percentage' : 'Amount'}
            id="value"
            type="number"
            step={formData.method.id === 'percentage' ? '1' : '0.01'}
            value={formData.value}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, value: e.target.value }))
            }
            error={errors.value}
            placeholder={
              formData.method.id === 'percentage'
                ? 'e.g., 10'
                : `e.g., ${formatCurrency(0, user.currency)}`
            }
          />

          {formData.value && (
            <div className="text-sm text-gray-500">
              Calculated amount:{' '}
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
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Add'} {formData.type.name}
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
        title="No Items Added"
        description="You need to add at least one item to the bill before adding Tax/Tip."
        icon={<ShoppingBagIcon className="h-12 w-12 text-blue-500" />}
        actions={[
          {
            label: 'Back to Bill',
            onClick: () => {
              setShowNoItemsDialog(false);
              navigate(`/bills/${id}`);
            },
            variant: 'outline',
            icon: ArrowLeftIcon
          },
          {
            label: 'Add Item',
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