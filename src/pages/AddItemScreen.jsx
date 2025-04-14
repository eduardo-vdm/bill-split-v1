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
import Dialog from '../components/Dialog';
import { generateId } from '../utils/helpers';
import { formatCurrency } from '../utils/formatters';
import { UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const splitMethods = [
  { id: 'equal', translationKey: 'splitMethods:equal' },
  { id: 'percentage', translationKey: 'splitMethods:percentage' },
  { id: 'value', translationKey: 'splitMethods:value' },
  { id: 'full', translationKey: 'splitMethods:full' }
];

export default function AddItemScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  const { t } = useTranslation(['bills', 'common', 'splitMethods']);
  const [showNoPeopleDialog, setShowNoPeopleDialog] = useState(false);

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
    } else {
      // For new items, if split method is equal, select all people by default
      setFormData(prev => ({
        ...prev,
        splitBetween: currentBill.people.map(person => person.id)
      }));
    }
  }, [currentBill, editItem, navigate]);

  useEffect(() => {
    if (currentBill && currentBill.people.length === 0 && !isEditing) {
      setShowNoPeopleDialog(true);
    }
  }, [currentBill, isEditing]);

  // Update value splits when price changes
  useEffect(() => {
    if (formData.splitMethod.id === 'value' && formData.price && formData.splitBetween.length > 0) {
      const price = parseFloat(formData.price);
      const baseValue = price / formData.splitBetween.length;
      const remainder = price - (baseValue * formData.splitBetween.length);

      const newValueSplits = {};
      formData.splitBetween.forEach((personId, index) => {
        // Add the remainder to the first person
        newValueSplits[personId] = (baseValue + (index === 0 ? remainder : 0)).toFixed(2);
      });

      setFormData(prev => ({
        ...prev,
        valueSplits: newValueSplits,
      }));
    }
  }, [formData.price, formData.splitMethod.id, formData.splitBetween]);

  // Update split between when split method changes
  useEffect(() => {
    if (formData.splitMethod.id === 'equal') {
      // For equal split, select all people
      setFormData(prev => ({
        ...prev,
        splitBetween: currentBill.people.map(person => person.id)
      }));
    } else if (formData.splitMethod.id === 'full') {
      // For full amount, clear selection
      setFormData(prev => ({
        ...prev,
        splitBetween: []
      }));
    }
  }, [formData.splitMethod.id, currentBill.people]);

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

      // Prevent deselecting the last person
      if (isSelected && prev.splitBetween.length === 1) {
        return prev;
      }

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
    const newPrice = e.target.value;
    setFormData((prev) => {
      const newState = { ...prev, price: newPrice };
      
      // Check if we're transitioning from valid to invalid price
      const wasPriceValid = prev.price && parseFloat(prev.price) > 0;
      const isPriceValid = newPrice && parseFloat(newPrice) > 0;
      
      if (wasPriceValid && !isPriceValid) {
        // Reset split method and people selection
        newState.splitMethod = splitMethods[0];
        newState.splitBetween = [];
        newState.percentages = {};
        newState.valueSplits = {};
      }
      
      return newState;
    });
  };

  const isPriceValid = formData.price !== '' && !isNaN(parseFloat(formData.price)) && parseFloat(formData.price) > 0;
  const hasMultiplePeople = formData.splitBetween.length > 1;

  // Debug logging
  console.log('Price:', formData.price);
  console.log('isPriceValid:', isPriceValid);

  return (
    <Layout title={t('bills:items.add')} showBack>
      <div className="max-w-lg mx-auto">
        {!currentBill ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">{t('bills:notFound')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('bills:items.name')}
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={errors.name}
              placeholder={t('bills:items.itemNamePlaceholder')}
              autoFocus
            />

            <Input
              label={t('bills:items.price')}
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handlePriceChange}
              error={errors.price}
              placeholder={t('bills:items.itemPricePlaceholder', { currency: user.currency })}
            />

            <div className="space-y-2">
              <label
                htmlFor="splitMethod"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('bills:items.split.title')}
              </label>
              <div className="flex items-center gap-2">
                <Select
                  id="splitMethod"
                  value={formData.splitMethod}
                  onChange={handleSplitMethodChange}
                  options={splitMethods}
                  className="flex-1"
                  disabled={!isPriceValid}
                  displayValue={(selected) => selected ? t(selected.translationKey) : t('bills:items.split.selectSplitMethod')}
                />
                <div className="tooltip">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={t('bills:items.split.splitMethodInfo')}
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
                      <p className="font-medium">{t('bills:items.split.splitMethodOptions')}:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <span className="font-medium">{t('bills:items.split.equal')}:</span> {t('bills:items.split.splitEqually')}
                        </li>
                        <li>
                          <span className="font-medium">{t('bills:items.split.percentage')}:</span> {t('bills:items.split.splitByPercentage')}
                        </li>
                        <li>
                          <span className="font-medium">{t('bills:items.split.value')}:</span> {t('bills:items.split.splitByValue')}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {t('bills:items.split.between')}
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
                    onClick={() => isPriceValid && handlePersonClick(person.id)}
                    className={!isPriceValid ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                ))}
              </div>
            </div>

            {formData.splitMethod.id === 'percentage' && formData.splitBetween.length > 0 && (
              <div className="space-y-4">
                {t('bills:items.split.percentages')}
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
                        disabled={!hasMultiplePeople}
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
                {t('bills:items.split.values')}
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
                        disabled={!hasMultiplePeople}
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
                {t('common:cancel')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('common:add')}
              </Button>
            </div>
          </form>
        )}
      </div>

      <Dialog
        isOpen={showNoPeopleDialog}
        onClose={() => {
          setShowNoPeopleDialog(false);
          navigate(`/bills/${id}`);
        }}
        title={t('bills:noPeopleAddedTitle')}
        description={t('bills:noPeopleAddedDescription')}
        icon={<UserGroupIcon className="h-12 w-12 text-blue-500" />}
        actions={[
          {
            label: t('common:backToBill'),
            onClick: () => {
              setShowNoPeopleDialog(false);
              navigate(`/bills/${id}`);
            },
            variant: 'outline',
            icon: ArrowLeftIcon
          },
          {
            label: t('bills:addPerson'),
            onClick: () => {
              setShowNoPeopleDialog(false);
              navigate(`/bills/${id}/add-person`);
            },
            icon: UserGroupIcon
          }
        ]}
      />
    </Layout>
  );
} 