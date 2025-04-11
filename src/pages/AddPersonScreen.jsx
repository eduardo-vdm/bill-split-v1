import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonAvatar from '../components/PersonAvatar';
import { generateId } from '../utils/helpers';

const PERSON_ICONS = ['👤', '👩', '👨', '👧', '👦', '👶', '👱‍♀️', '👱', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳', '👩‍🦲', '👨‍🦲'];

export default function AddPersonScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  
  const editPerson = location.state?.editPerson;
  const isEditing = !!editPerson;

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [icon, setIcon] = useState(PERSON_ICONS[0]);

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
      setIcon(editPerson.icon);
    }
  }, [editPerson]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const personData = {
      id: editPerson ? editPerson.id : generateId('person-'),
      name: name.trim(),
      icon,
    };

    const updatedBill = {
      ...currentBill,
      people: editPerson
        ? currentBill.people.map(person =>
            person.id === editPerson.id ? personData : person
          )
        : [...(currentBill.people || []), personData],
    };

    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
    navigate(`/bills/${id}`);
  };

  return (
    <Layout title={isEditing ? 'Edit Person' : 'Add Person'} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <PersonAvatar
              name={name || 'New Person'}
              icon={icon}
              size="lg"
              showName={false}
            />
            <div className="grid grid-cols-8 gap-2">
              {PERSON_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    icon === emoji
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Name"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            error={error}
            placeholder="Enter name"
            autoFocus
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
              {isEditing ? 'Save Changes' : 'Add Person'}
            </Button>
          </div>
        </form>

        {currentBill.recentPeople?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Recently Added People
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {currentBill.recentPeople.map((person) => (
                <PersonAvatar
                  key={person.id}
                  name={person.name}
                  icon={person.icon}
                  showName
                  onClick={() => {
                    setName(person.name);
                    setIcon(person.icon);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 