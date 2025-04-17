import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { billTypes, generateId } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

export default function NewBillScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addBill, updateBill } = useBillsContext();
  const { updateCurrentBill, clearCurrentBill } = useCurrentBillContext();
  const { t } = useTranslation(['bills', 'common', 'billTypes']);
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
      navigate(`/bills/${editBill.id}`);
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
          <Input
            label={t('bills:name')}
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={errors.name}
            placeholder={t('bills:namePlaceholder')}
          />

          <Select
            label={t('bills:type')}
            options={billTypes}
            value={formData.type}
            onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
            displayValue={(selected) => selected ? `${selected.icon} ${t(selected.translationKey)}` : t('bills:selectType')}
          />

          <Input
            label={t('bills:place')}
            id="place"
            type="text"
            value={formData.place}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, place: e.target.value }))
            }
            error={errors.place}
            placeholder={t('bills:placePlaceholder')}
          />

          <Input
            label={t('bills:date')}
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit" className="flex-1">
              {editBill ? t('common:buttons.save') : t('common:buttons.create')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 