import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronUpIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { FunnelIcon as FunnelIconSolid } from '@heroicons/react/24/solid';
import { Menu } from '@headlessui/react';
import { useBillsContext } from '../contexts/BillsContext';
import { useUserContext } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';
import { billTypes, generateId } from '../utils/helpers';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import Tooltip from '../components/Tooltip';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function MainScreen() {
  const navigate = useNavigate();
  const { bills, deleteBill, addBill } = useBillsContext();
  const { user, updateUser } = useUserContext();
  const [billToDelete, setBillToDelete] = useState(null);
  const [searchText, setSearchText] = useState(user.preferences?.search?.text || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState(user.preferences?.sortBills || 'dateDesc');
  const { t, i18n } = useTranslation();
  const searchButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchButtonRef.current && !searchButtonRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const calculateBillTotal = (bill) => {
    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const specialItemsTotal = bill.specialItems.reduce((sum, item) => {
      if (item.method === 'percentage') {
        return sum + (subtotal * item.value) / 100;
      }
      return sum + item.value;
    }, 0);
    return subtotal + specialItemsTotal;
  };

  const handleDeleteBill = (e, bill) => {
    e.stopPropagation();
    setBillToDelete(bill);
  };

  const handleConfirmDelete = () => {
    if (billToDelete) {
      deleteBill(billToDelete.id);
      setBillToDelete(null);
    }
  };

  const handleEditBill = (e, bill) => {
    e.stopPropagation();
    navigate('/bills/new', { state: { editBill: bill } });
  };

  const handleDuplicateBill = (e, bill) => {
    e.stopPropagation();
    const newBill = {
      ...bill,
      id: generateId('bill-'),
      name: `Copy of ${bill.name}`,
      date: new Date().toISOString().split('T')[0],
    };
    const createdBill = addBill(newBill);
    navigate('/bills/new', { state: { editBill: createdBill } });
  };

  const handleSearchChange = (e) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);
    updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        search: {
          ...(user.preferences?.search || {}),
          text: newSearchText,
          // Future fields will be added here:
          // persons: [],
          // valueRange: { min: null, max: null },
          // place: '',
          // dateRange: { start: null, end: null },
          // type: null
        }
      }
    });
  };

  const handleClearSearch = () => {
    setSearchText('');
    updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        search: undefined
      }
    });
  };

  const sortedAndFilteredBills = useMemo(() => {
    const filtered = bills.filter(bill => 
      bill.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'place':
          return a.place.localeCompare(b.place);
        case 'type':
          const typeA = billTypes.find(t => t.id === a.type)?.translationKey || '';
          const typeB = billTypes.find(t => t.id === b.type)?.translationKey || '';
          return t(typeA).localeCompare(t(typeB));
        case 'totalDesc':
          return calculateBillTotal(b) - calculateBillTotal(a);
        case 'totalAsc':
          return calculateBillTotal(a) - calculateBillTotal(b);
        case 'dateAsc':
          return new Date(a.date) - new Date(b.date);
        case 'dateDesc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }, [bills, searchText, sortBy, t]);

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        sortBills: newSortBy
      }
    });
  };

  return (
    <Layout title={t('bills:title')}>
      <div className="max-w-[48rem] min-w-[20rem] mx-auto lg:max-w-unset lg:w-min">
        <div className="flex flex-row gap-2 mb-6 justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">
              {t('bills:title')}
            </h1>
            {bills.length > 0 && (
              <div className="flex flex-col gap-1">
                {searchText && (
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5" />
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {t('bills:search.filterCount', { 
                        filtered: sortedAndFilteredBills.length, 
                        total: bills.length 
                      })}
                    </span>
                    <button
                      onClick={handleClearSearch}
                      className="inline-flex items-center gap-1 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      {t('bills:search.clearButton')}
                    </button>
                  </div>
                )}
                <div className="flex flex-row gap-1 items-center">
                  <ArrowsUpDownIcon className="w-5 h-5" />
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {t('bills:sort.titleLabel')} <span className="font-bold">{t(`bills:sort.options.${sortBy}`)}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/bills/new')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('bills:createNew')}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>

        {bills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('bills:noBills')}</p>
            <button
              onClick={() => navigate('/bills/new')}
              className="bg-tertiary-600 dark:bg-tertiary-600 text-white dark:drop-shadow-white drop-shadow-dark py-2 px-4 rounded-lg hover:bg-tertiary-700 dark:hover:bg-tertiary-700"
            >
              {t('bills:createFirstBill')}
            </button>
          </div>
        ) : sortedAndFilteredBills.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <FunnelIconSolid className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {t('bills:search.noResults.title')}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {t('bills:search.noResults.description')}
            </p>
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-2 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
              {t('bills:search.noResults.clearButton')}
            </button>
          </div>
        ) : (
          <div className="flex justify-center relative">
            <div className="flex flex-wrap gap-4 justify-start w-min lg:w-auto lg:min-w-[648px] pb-14">
              {sortedAndFilteredBills.map((bill) => {
                const billType = billTypes.find((t) => t.id === bill.type);
                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      onClick={() => navigate(`/bills/${bill.id}`)}
                      className="w-[312px] bg-gradient-to-r from-tertiary-500 from-5% to-gray-100 dark:to-gray-900 to-5% hover:to-gray-50 to-5% dark:hover:to-gray-800 to-5% hover:from-secondary-600 dark:hover:from-secondary-600 rounded-lg rounded-r-none p-4 border-t-2 border-tertiary-500 dark:border-tertiary-500 hover:border-secondary-500 dark:hover:border-secondary-500 dark:drop-shadow-white drop-shadow-dark transition-all relative hover:bg-white dark:hover:bg-gray-700 pl-6"
                    >
                      <div className="absolute bottom-0 left-0">
                        <div className="card-accent-bottom-left"></div>
                        <div className="absolute bottom-0.5 left-0.5">
                          <Tooltip 
                            content={t(billType?.translationKey)} 
                            position="right"
                            className="z-50"
                          >
                            <span 
                              role="img" 
                              aria-label={bill.type} 
                              className="text-2xl cursor-help"
                              onClick={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {billType?.icon}
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="card-accent-top-right">
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium max-w-[200px] truncate" aria-label={bill.name} title={bill.name}>{bill.name}</h3>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                            <div className="max-w-[100px] truncate" aria-label={bill.place} title={bill.place}>{bill.place}</div> • <div className="max-w-[100px] truncate" aria-label={new Date(bill.date).toLocaleDateString(i18n.language)} title={new Date(bill.date).toLocaleDateString(i18n.language)}>{new Date(bill.date).toLocaleDateString(i18n.language)}</div>
                          </p>
                        </div>
                        <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          <div className="max-w-[80px] truncate" aria-label={formatCurrency(calculateBillTotal(bill), user.currency)} title={formatCurrency(calculateBillTotal(bill), user.currency)}>{formatCurrency(calculateBillTotal(bill), user.currency)}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 mb-8 w-full">
                        {bill.people?.map((person) => (
                          <Tooltip
                            key={person.id}
                            content={person.name}
                            position="top"
                            className="z-50"
                            showOnTouch={true}
                          >
                            <span 
                              className={`
                                text-2xl cursor-help hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-colors
                                ${person.name === user.name ? 'ring-2 ring-primary-500 dark:ring-primary-400 rounded-full' : ''}
                              `}
                              onClick={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {person.icon}
                            </span>
                          </Tooltip>
                        ))}
                      </div>
                      <div className="absolute bottom-3 right-3 flex space-x-1">
                        <button
                          className="p-1.5 text-gray-400 hover:text-tertiary-500 dark:text-gray-500 dark:hover:text-tertiary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => handleEditBill(e, bill)}
                          aria-label={`Edit ${bill.name}`}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-tertiary-500 dark:text-gray-500 dark:hover:text-tertiary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => handleDuplicateBill(e, bill)}
                          aria-label={`Duplicate ${bill.name}`}
                        >
                          <DocumentDuplicateIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => handleDeleteBill(e, bill)}
                          aria-label={`Delete ${bill.name}`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer with search and sort */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-t-gray-400 dark:border-t-gray-700 py-2 px-4 z-20">
          <div className="w-[calc(312px+4rem)] lg:w-[calc(624px+8rem)] mx-auto px-4 sm:px-6 lg:px-8 flex justify-evenly items-center">
            <div className="relative" ref={searchButtonRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`
                  p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative
                  ${searchText ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}
                `}
                aria-label={t('bills:search.toggle')}
              >
                {searchText ? <FunnelIcon className="w-6 h-6" /> : <MagnifyingGlassIcon className="w-6 h-6" />}
                {searchText && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                )}
                {isSearchOpen && (
                  <ChevronUpIcon className="w-4 h-4 absolute -top-3 left-1/2 -translate-x-1/2 text-gray-400" />
                )}
              </button>
              
              {/* Search Popover */}
              {isSearchOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        placeholder={t('bills:search.placeholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label={t('bills:search.close')}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {searchText && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleClearSearch}
                          className="inline-flex items-center gap-1.5 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          {t('bills:search.clearButton')}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Future filter options will go here */}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <ArrowsUpDownIcon className="w-5 h-5" />
                  <span>{t('bills:sort.label')}</span>
                </Menu.Button>

                <Menu.Items className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'dateDesc' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'dateDesc' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.dateDesc')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'dateAsc' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'dateAsc' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.dateAsc')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'name' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'name' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.name')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'place' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'place' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.place')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'type' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'type' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.type')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'totalDesc' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'totalDesc' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.totalDesc')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleSortChange({ target: { value: 'totalAsc' }})}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            sortBy === 'totalAsc' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {t('bills:sort.options.totalAsc')}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
          <button
            onClick={() => navigate('/bills/new')}
            className="absolute left-[calc(50vw+140px)] lg:left-[calc(50vw+(148px*2))] bottom-12 text-white flex content-center justify-center w-24 h-24 text-4xl z-30"
            aria-label={t('navigation:newBill')}
          >
            <img 
              src="/ticket_icon_1.svg"
              alt="Create Bill" 
              className="h-24 drop-shadow-white-sm brightness-100 hover:brightness-125"
              style={{
                margin: '0 auto'
              }}
            />
            <span className="text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-7 pointer-events-none text-secondary-400 drop-shadow-dark font-bold">+</span>
          </button>
        </div>

        <ConfirmDialog
          isOpen={!!billToDelete}
          onClose={() => setBillToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t('bills:deleteBill')}
          description={t('bills:deleteBillConfirm')}
        />
      </div>
    </Layout>
  );
}