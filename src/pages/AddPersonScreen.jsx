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
import { generateId } from '../utils/helpers';

const PERSON_ICONS = ['👤', '👩', '👨', '👧', '👦', '👶', '👱‍♀️', '👱', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳', '👩‍🦲', '👨‍🦲'];

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
  const [icon, setIcon] = useState(PERSON_ICONS[0]);

  const isUserInBill = currentBill.people?.some(person => person.name === user.name);
  const isNameUnique = !currentBill.people?.some(person => 
    person.name.toLowerCase() === name.trim().toLowerCase() && 
    (!editPerson || person.id !== editPerson.id)
  );

  // Get list of used icons, excluding the current person if editing
  const usedIcons = currentBill.people
    ?.filter(person => !editPerson || person.id !== editPerson.id)
    ?.map(person => person.icon) || [];

  // Check if an icon is available (first icon is always available)
  const isIconAvailable = (emoji) => {
    return emoji === PERSON_ICONS[0] || !usedIcons.includes(emoji);
  };

  useEffect(() => {
    if (editPerson) {
      setName(editPerson.name);
      setIcon(editPerson.icon);
    }
  }, [editPerson]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('person:name'));
      return;
    }

    if (!isNameUnique) {
      setError(t('person:add.nameExists'));
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

  const handleAddYourself = () => {
    if (!user.name) return;

    const personData = {
      id: generateId('person-'),
      name: user.name,
      icon: user.icon || PERSON_ICONS[0],
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
              {PERSON_ICONS.map((emoji) => {
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

          <Input
            label={t('person:add.name')}
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            error={error}
            placeholder={t('person:add.namePlaceholder')}
            autoFocus
          />

          {!isEditing && user.name && !isUserInBill && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
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