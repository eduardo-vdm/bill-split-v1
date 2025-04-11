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
  { id: 'value', name: 'Split by Value' },
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
    percentages: {},
    valueSplits: {},
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
        percentages: editItem.percentages || {},
        valueSplits: editItem.valueSplits || {},
      });
    }
  }, [currentBill, editItem, navigate]);

  // Update value splits when price changes
  useEffect(() => {
    if (formData.splitMethod.id === 'value' && formData.splitBetween.length > 0) {
      setFormData((prev) => {
        const price = parseFloat(prev.price) || 0;
        const currentTotal = Object.values(prev.valueSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0);
        
        // If we're editing an existing item with custom splits, scale the existing splits proportionally
        if (editItem && editItem.valueSplits && Object.keys(editItem.valueSplits).length > 0) {
          const scaleFactor = price / currentTotal;
          const newValueSplits = {};
          
          Object.entries(prev.valueSplits).forEach(([id, value]) => {
            newValueSplits[id] = (parseFloat(value) * scaleFactor).toFixed(2);
          });
          
          return {
            ...prev,
            valueSplits: newValueSplits,
          };
        } else {
          // For new items or items without custom splits, distribute equally
          const baseValue = Math.floor((price * 100) / prev.splitBetween.length) / 100;
          const remainder = price - (baseValue * prev.splitBetween.length);
          
          const newValueSplits = {};
          prev.splitBetween.forEach((id, index) => {
            newValueSplits[id] = (baseValue + (index === 0 ? remainder : 0)).toFixed(2);
          });

          return {
            ...prev,
            valueSplits: newValueSplits,
          };
        }
      });
    }
  }, [formData.price, formData.splitMethod.id, formData.splitBetween.length, editItem]);

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
      valueSplits: formData.valueSplits,
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
      let newPercentages = { ...prev.percentages };
      let newValueSplits = { ...prev.valueSplits };

      if (isSelected) {
        // Remove person
        newSplitBetween = prev.splitBetween.filter((id) => id !== personId);
        
        if (prev.splitMethod.id === 'percentage') {
          // Remove the person's percentage
          delete newPercentages[personId];
          
          // Redistribute the removed percentage equally among remaining people
          const remainingPeople = newSplitBetween;
          if (remainingPeople.length > 0) {
            const basePercentage = Math.floor(100 / remainingPeople.length);
            const remainder = 100 - (basePercentage * remainingPeople.length);
            
            remainingPeople.forEach((id, index) => {
              newPercentages[id] = (basePercentage + (index === 0 ? remainder : 0)).toFixed(2);
            });
          }
        } else if (prev.splitMethod.id === 'value') {
          // Remove the person's value
          delete newValueSplits[personId];
          
          // Redistribute the removed value among remaining people
          const remainingPeople = newSplitBetween;
          if (remainingPeople.length > 0) {
            const price = parseFloat(prev.price);
            const baseValue = Math.floor((price * 100) / remainingPeople.length) / 100;
            const remainder = price - (baseValue * remainingPeople.length);
            
            remainingPeople.forEach((id, index) => {
              newValueSplits[id] = (baseValue + (index === 0 ? remainder : 0)).toFixed(2);
            });
          }
        }
      } else {
        // Add person
        newSplitBetween = [...prev.splitBetween, personId];
        
        if (prev.splitMethod.id === 'percentage') {
          // Initialize all percentages to be equal
          const basePercentage = Math.floor(100 / newSplitBetween.length);
          const remainder = 100 - (basePercentage * newSplitBetween.length);
          
          newSplitBetween.forEach((id, index) => {
            newPercentages[id] = (basePercentage + (index === 0 ? remainder : 0)).toFixed(2);
          });
        } else if (prev.splitMethod.id === 'value') {
          // Initialize all values to be equal
          const price = parseFloat(prev.price);
          const baseValue = Math.floor((price * 100) / newSplitBetween.length) / 100;
          const remainder = price - (baseValue * newSplitBetween.length);
          
          newSplitBetween.forEach((id, index) => {
            newValueSplits[id] = (baseValue + (index === 0 ? remainder : 0)).toFixed(2);
          });
        }
      }

      return {
        ...prev,
        splitBetween: newSplitBetween,
        percentages: newPercentages,
        valueSplits: newValueSplits,
      };
    });
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

  const handleValueChange = (personId, value) => {
    setFormData((prev) => {
      const newValueSplits = { ...prev.valueSplits };
      const oldValue = parseFloat(newValueSplits[personId] || 0);
      const newValue = parseFloat(value);
      const diff = newValue - oldValue;
      
      // Get other person IDs
      const otherPersonIds = prev.splitBetween.filter(id => id !== personId);
      const otherPersonCount = otherPersonIds.length;
      
      if (otherPersonCount > 0) {
        // Calculate how much to adjust each other person's amount
        const adjustmentPerPerson = -diff / otherPersonCount;
        
        // Update other people's amounts
        otherPersonIds.forEach(id => {
          const currentValue = parseFloat(newValueSplits[id] || 0);
          newValueSplits[id] = Math.max(0, Math.min(parseFloat(prev.price), currentValue + adjustmentPerPerson));
        });
      }
      
      // Update the changed person's amount
      newValueSplits[personId] = newValue;
      
      return {
        ...prev,
        valueSplits: newValueSplits,
      };
    });
  };

  const handleSplitMethodChange = (method) => {
    setFormData((prev) => {
      const newSplitBetween = method.id === 'full' ? prev.splitBetween.slice(0, 1) : prev.splitBetween;
      let newPercentages = {};
      let newValueSplits = {};

      if (method.id === 'percentage') {
        // Initialize all percentages to be equal
        const basePercentage = Math.floor(100 / newSplitBetween.length);
        const remainder = 100 - (basePercentage * newSplitBetween.length);
        
        newSplitBetween.forEach((personId, index) => {
          newPercentages[personId] = (basePercentage + (index === 0 ? remainder : 0)).toFixed(2);
        });
      } else if (method.id === 'value') {
        const price = parseFloat(prev.price);
        const baseValue = Math.floor((price * 100) / newSplitBetween.length) / 100;
        const remainder = price - (baseValue * newSplitBetween.length);
        
        newSplitBetween.forEach((personId, index) => {
          newValueSplits[personId] = (baseValue + (index === 0 ? remainder : 0)).toFixed(2);
        });
      }

      return {
        ...prev,
        splitMethod: method,
        splitBetween: newSplitBetween,
        percentages: newPercentages,
        valueSplits: newValueSplits,
      };
    });
  };

  const handlePriceChange = (e) => {
    setFormData((prev) => ({ ...prev, price: e.target.value }));
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
              onChange={handlePriceChange}
              error={errors.price}
              placeholder={`e.g., ${formatCurrency(10, user.currency)}`}
            />

            <div className="space-y-2">
              <label
                htmlFor="splitMethod"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Split Method
              </label>
              <div className="flex items-center gap-2">
                <Select
                  id="splitMethod"
                  value={formData.splitMethod}
                  onChange={handleSplitMethodChange}
                  options={splitMethods}
                  className="flex-1"
                />
                <div className="tooltip">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Split method information"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="tooltip-text">
                    <div className="space-y-1">
                      <p className="font-medium">Split Method Options:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <span className="font-medium">Equal:</span> Split the item cost equally among selected people
                        </li>
                        <li>
                          <span className="font-medium">Full Amount:</span> Each selected person pays the full item cost
                        </li>
                        <li>
                          <span className="font-medium">Split by Percentage:</span> Distribute the cost using percentage sliders (total must equal 100%)
                        </li>
                        <li>
                          <span className="font-medium">Split by Value:</span> Set custom amounts for each person (total must equal item price)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            {formData.splitMethod.id === 'value' && formData.splitBetween.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Split Values
                </label>
                {formData.splitBetween.map((personId) => {
                  const person = currentBill.people.find(p => p.id === personId);
                  const amount = parseFloat(formData.valueSplits[personId] || 0);
                  
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
                          {formatCurrency(amount, user.currency)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={formData.price}
                        step="0.01"
                        value={amount}
                        onChange={(e) => handleValueChange(personId, e.target.value)}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  );
                })}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatCurrency(
                      Object.values(formData.valueSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0),
                      user.currency
                    )}
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