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
    percentages: {},
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!currentBill) {
      navigate('/');
      return;
    }

    if (editItem) {
      setFormData({
        name: editItem.name,
        price: editItem.price.toString(),
        splitMethod: splitMethods.find(m => m.id === editItem.splitMethod) || splitMethods[0],
        splitBetween: editItem.splitBetween || [],
        customSplits: editItem.customSplits || {},
        percentages: editItem.percentages || {},
      });
    }
  }, [currentBill, editItem, navigate]);

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
      percentages: formData.percentages,
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

      const newPercentages = { ...prev.percentages };
      if (!isSelected && formData.splitMethod.id === 'percentage') {
        const totalPeople = newSplitBetween.length;
        newPercentages[personId] = (100 / totalPeople).toFixed(2);
      } else if (isSelected) {
        delete newPercentages[personId];
      }

      return {
        ...prev,
        splitBetween: newSplitBetween,
        percentages: newPercentages,
      };
    });
    setErrors((prev) => ({ ...prev, splitBetween: '' }));
  };

  const handlePercentageChange = (personId, value) => {
    setFormData((prev) => {
      const newPercentages = { ...prev.percentages };
      const oldValue = parseFloat(newPercentages[personId] || 0);
      const newValue = parseFloat(value);
      const diff = newValue - oldValue;
      
      // Get other person IDs
      const otherPersonIds = prev.splitBetween.filter(id => id !== personId);
      const otherPersonCount = otherPersonIds.length;
      
      if (otherPersonCount > 0) {
        // Calculate how much to adjust each other person's percentage
        const adjustmentPerPerson = -diff / otherPersonCount;
        
        // Update other people's percentages
        otherPersonIds.forEach(id => {
          const currentValue = parseFloat(newPercentages[id] || 0);
          newPercentages[id] = Math.max(0, Math.min(100, currentValue + adjustmentPerPerson));
        });
      }
      
      // Update the changed person's percentage
      newPercentages[personId] = newValue;
      
      return {
        ...prev,
        percentages: newPercentages,
      };
    });
  };

  const handleSplitMethodChange = (method) => {
    setFormData((prev) => {
      const newSplitBetween = method.id === 'full' ? prev.splitBetween.slice(0, 1) : prev.splitBetween;
      let newPercentages = {};

      if (method.id === 'percentage') {
        const totalPeople = newSplitBetween.length;
        newSplitBetween.forEach((personId) => {
          newPercentages[personId] = (100 / totalPeople).toFixed(2);
        });
      }

      return {
        ...prev,
        splitMethod: method,
        splitBetween: newSplitBetween,
        percentages: newPercentages,
      };
    });
  };

  return (
    <Layout title={isEditing ? 'Edit Item' : 'Add Item'} showBack>
      <div className="max-w-lg mx-auto">
        {!currentBill ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Bill not found</p>
          </div>
        ) : (
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

            {formData.splitMethod.id === 'percentage' && formData.splitBetween.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Split Percentages
                </label>
                {formData.splitBetween.map((personId) => {
                  const person = currentBill.people.find(p => p.id === personId);
                  const percentage = parseFloat(formData.percentages[personId] || 0);
                  
                  return (
                    <div key={personId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <PersonAvatar
                            name={person.name}
                            icon={person.icon}
                            size="sm"
                            showName={false}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{person.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={percentage}
                        onChange={(e) => handlePercentageChange(personId, e.target.value)}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  );
                })}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Object.values(formData.percentages).reduce((sum, val) => sum + parseFloat(val || 0), 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

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
        )}
      </div>
    </Layout>
  );
} 