import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { billTypes, generateId, getDateInputLocale } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

export default function NewBillScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addBill, updateBill } = useBillsContext();
  const { updateCurrentBill, clearCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  const { t, i18n } = useTranslation(['bills', 'common', 'billTypes']);
  const editBill = location.state?.editBill;

  const [formData, setFormData] = useState({
    name: '',
    type: billTypes[0].id,
    place: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    clearCurrentBill();
    if (editBill) {
      setFormData({
        name: editBill.name,
        type: editBill.type,
        place: editBill.place,
        date: editBill.date,
      });
    }
  }, [editBill, clearCurrentBill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('bills:errors.nameRequired');
    }
    if (!formData.type) {
      newErrors.type = t('bills:errors.typeRequired');
    }
    if (!formData.place.trim()) {
      newErrors.place = t('bills:errors.placeRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editBill) {
      // Update existing bill
      const updatedBill = {
        ...editBill,
        ...formData,
      };
      updateBill(editBill.id, updatedBill);
      updateCurrentBill(updatedBill);
      navigate(-1);
    } else {
      // Create new bill
      const newBill = {
        id: generateId('bill-'),
        ...formData,
        people: [],
        items: [],
        specialItems: [],
        total: 0,
      };
      const createdBill = addBill(newBill);
      clearCurrentBill();
      updateCurrentBill(createdBill);
      navigate(`/bills/${createdBill.id}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  return (
    <Layout title={editBill ? t('bills:edit') : t('bills:new')} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('bills:name')}
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder={t('bills:namePlaceholder')}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('bills:type')}
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
            >
              {billTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {t(type.translationKey)}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.type}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="place" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('bills:place')}
            </label>
            <input
              type="text"
              id="place"
              value={formData.place}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, place: e.target.value }));
                setErrors((prev) => ({ ...prev, place: '' }));
              }}
              placeholder={t('bills:placePlaceholder')}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
            />
            {errors.place && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.place}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('bills:date')}
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
              lang={getDateInputLocale(i18n.language)}
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-tertiary-600 dark:bg-tertiary-600 text-white dark:drop-shadow-white drop-shadow-dark py-2 px-4 rounded-lg hover:bg-tertiary-700 dark:hover:bg-tertiary-700">
              {editBill ? t('common:buttons.save') : t('common:buttons.create')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 