import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { billTypes, generateId } from '../utils/helpers';

export default function NewBillScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addBill, updateBill } = useBillsContext();
  const { updateCurrentBill, clearCurrentBill } = useCurrentBillContext();
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
      newErrors.name = 'Bill name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Bill type is required';
    }
    if (!formData.place.trim()) {
      newErrors.place = 'Place is required';
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
    <Layout title={editBill ? 'Edit Bill' : 'New Bill'} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Bill Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Dinner at Italian Restaurant"
            autoFocus
          />

          <Select
            label="Bill Type"
            options={billTypes}
            value={billTypes.find((type) => type.id === formData.type)}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value.id }))
            }
            error={errors.type}
            displayValue={(selected) =>
              selected ? `${selected.icon} ${selected.name}` : 'Select type'
            }
          />

          <Input
            label="Place"
            id="place"
            name="place"
            value={formData.place}
            onChange={handleChange}
            error={errors.place}
            placeholder="e.g., La Cucina"
          />

          <Input
            label="Date"
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />

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
              {editBill ? 'Save Changes' : 'Create Bill'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 