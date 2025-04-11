import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import PersonAvatar from '../components/PersonAvatar';
import { generateId } from '../utils/helpers';
import { formatCurrency } from '../utils/formatters';

const splitMethods = [
  { id: 'equal', name: 'Split Equally' },
  { id: 'percentage', name: 'Split by Percentage' },
  { id: 'custom', name: 'Custom Amount' },
  { id: 'full', name: 'Full Amount' },
];

export default function AddItemScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  
  const editItem = location.state?.editItem;
  const isEditing = !!editItem;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    splitMethod: splitMethods[0],
    splitBetween: [],
    customSplits: {},
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        price: editItem.price.toString(),
        splitMethod: splitMethods.find(m => m.id === editItem.splitMethod) || splitMethods[0],
        splitBetween: editItem.splitBetween || [],
        customSplits: editItem.customSplits || {},
      });
    }
  }, [editItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.splitBetween.length === 0) {
      newErrors.splitBetween = 'Select at least one person';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const itemData = {
      id: editItem ? editItem.id : generateId('item-'),
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      splitMethod: formData.splitMethod.id,
      splitBetween:
        formData.splitMethod.id === 'full'
          ? [formData.splitBetween[0]]
          : formData.splitBetween,
      customSplits: formData.customSplits,
    };

    const updatedBill = {
      ...currentBill,
      items: editItem
        ? currentBill.items.map(item => 
            item.id === editItem.id ? itemData : item
          )
        : [...(currentBill.items || []), itemData]
    };

    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
    navigate(`/bills/${id}`);
  };

  const handlePersonClick = (personId) => {
    setFormData((prev) => {
      const isSelected = prev.splitBetween.includes(personId);
      let newSplitBetween;

      if (formData.splitMethod.id === 'full') {
        newSplitBetween = isSelected ? [] : [personId];
      } else {
        newSplitBetween = isSelected
          ? prev.splitBetween.filter((id) => id !== personId)
          : [...prev.splitBetween, personId];
      }

      return {
        ...prev,
        splitBetween: newSplitBetween,
      };
    });
    setErrors((prev) => ({ ...prev, splitBetween: '' }));
  };

  const handleSplitMethodChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      splitMethod: method,
      splitBetween: method.id === 'full' ? prev.splitBetween.slice(0, 1) : prev.splitBetween,
    }));
  };

  return (
    <Layout title={isEditing ? 'Edit Item' : 'Add Item'} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Item Name"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={errors.name}
            placeholder="e.g., Pizza Margherita"
            autoFocus
          />

          <Input
            label="Price"
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            error={errors.price}
            placeholder={`e.g., ${formatCurrency(10, user.currency)}`}
          />

          <Select
            label="Split Method"
            options={splitMethods}
            value={formData.splitMethod}
            onChange={handleSplitMethodChange}
            displayValue={(selected) => selected.name}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Split Between
            </label>
            {errors.splitBetween && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                {errors.splitBetween}
              </p>
            )}
            <div className="grid grid-cols-4 gap-4">
              {currentBill.people?.map((person) => (
                <PersonAvatar
                  key={person.id}
                  name={person.name}
                  icon={person.icon}
                  showName
                  selected={formData.splitBetween.includes(person.id)}
                  onClick={() => handlePersonClick(person.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 