import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useBillsContext } from '../contexts/BillsContext';
import { useCurrentBillContext } from '../contexts/CurrentBillContext';
import { useUserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import PersonAvatar from '../components/PersonAvatar';
import { generateId, personIcons } from '../utils/helpers';

export default function AddPersonScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { updateBill } = useBillsContext();
  const { currentBill, updateCurrentBill } = useCurrentBillContext();
  const { user } = useUserContext();
  const { t } = useTranslation();
  
  const editPerson = location.state?.editPerson;
  const isEditing = !!editPerson;

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [icon, setIcon] = useState(personIcons[0]);

  const isUserInBill = currentBill.people?.some(person => person.name === user.name);
  const isNameUnique = !currentBill.people?.some(person => 
    person.name.toLowerCase() === name.trim().toLowerCase() && 
    (!editPerson || person.id !== editPerson.id)
  );

  // Get list of used icons, excluding the current person if editing
  const usedIcons = currentBill.people
    ?.filter(person => !editPerson || person.id !== editPerson.id)
    ?.map(person => person.icon) || [];

  // Check if an icon is available (first icon is always available except if it's the user's icon)
  const isIconAvailable = (emoji) => {
    // If it's the user's icon, it's not available
    if (emoji === user.icon) return false;
    // If it's the first icon and not the user's icon, it's available
    if (emoji === personIcons[0]) return true;
    // Otherwise check if it's already used
    return !usedIcons.includes(emoji);
  };

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
      setIcon(editPerson.icon);
    }
  }, [editPerson]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let errorMessage = '';

    if (!name.trim()) {
      errorMessage = t('person:add.nameRequired');
    } else if (name.trim().toLowerCase() === user.name.toLowerCase()) {
      errorMessage = t('person:add.sameNameAsUser');
    } else if (currentBill.people.some(
      person => person.name.toLowerCase() === name.trim().toLowerCase()
    )) {
      errorMessage = t('person:add.nameExists');
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const newPerson = {
      id: generateId('person-'),
      name: name.trim(),
      icon: icon || '👤',
    };

    const updatedBill = {
      ...currentBill,
      people: [...currentBill.people, newPerson],
    };

    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
    navigate(`/bills/${id}`);
  };

  const handleAddYourself = () => {
    if (!user.name) return;

    const personData = {
      id: generateId('person-'),
      name: user.name,
      icon: user.icon || personIcons[0],
    };

    const updatedBill = {
      ...currentBill,
      people: [...(currentBill.people || []), personData],
    };

    updateBill(id, updatedBill);
    updateCurrentBill(updatedBill);
    navigate(`/bills/${id}`);
  };

  return (
    <Layout title={isEditing ? t('person:add.editTitle') : t('person:add.title')} showBack>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <PersonAvatar
              name={name || t('person:name')}
              icon={icon}
              size="lg"
              showName={false}
            />
            <div className="grid grid-cols-8 gap-2">
              {personIcons.map((emoji) => {
                const isAvailable = isIconAvailable(emoji);
                const isSelected = icon === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => isAvailable && setIcon(emoji)}
                    disabled={!isAvailable}
                    className={`text-2xl p-2 rounded-lg transition-colors relative
                      ${isSelected
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : isAvailable
                          ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                    title={!isAvailable ? t('person:iconUsed') : undefined}
                  >
                    {emoji}
                    {!isAvailable && (
                      <span className="absolute top-0 right-0 text-xs text-gray-500 dark:text-gray-400">
                        🔒
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              {t('person:add.name')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear error when user types
              }}
              placeholder={t('person:add.namePlaceholder')}
              className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              required
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {!isEditing && user.name && !isUserInBill && (
            <div className="flex items-center justify-center space-x-2 text-md text-gray-600 dark:text-gray-400">
              <span>{t('person:add.or')}</span>
              <button
                type="button"
                onClick={handleAddYourself}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('person:add.addYourself')}
              </button>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              {t('person:add.cancel')}
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? t('person:add.save') : t('person:add.add')}
            </Button>
          </div>
        </form>

        {currentBill.recentPeople?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              {t('person:add.recent')}
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