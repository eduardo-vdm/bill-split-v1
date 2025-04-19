export const mockUser = {
  name: 'John Doe',
  language: 'en',
  currency: 'USD',
  icon: '👤',
  theme: 'light',
};

const generateIcon = () => {
  const icons = ['👤', '👩', '👨', '🧑', '👱', '👴', '👵', '🧔'];
  return icons[Math.floor(Math.random() * icons.length)];
};

export const mockBills = [
  {
    id: '1',
    name: 'Dinner at Italian Restaurant',
    type: 'dining',
    place: 'La Cucina',
    date: '2024-04-09T19:30:00.000Z',
    persons: [
      { id: 'p1', name: 'John', icon: '👤' },
      { id: 'p2', name: 'Alice', icon: '👩' },
      { id: 'p3', name: 'Bob', icon: '👨' },
    ],
    items: [
      {
        id: 'i1',
        name: 'Margherita Pizza',
        price: 18.99,
        splitBetween: ['p1', 'p2'],
        splitMethod: 'equal',
      },
      {
        id: 'i2',
        name: 'Spaghetti Carbonara',
        price: 16.99,
        splitBetween: ['p3'],
        splitMethod: 'full',
      },
      {
        id: 'i3',
        name: 'Wine Bottle',
        price: 35.00,
        splitBetween: ['p1', 'p2', 'p3'],
        splitMethod: 'equal',
      },
    ],
    specialItems: [
      {
        id: 's1',
        type: 'tip',
        value: 15,
        method: 'percentage',
      },
      {
        id: 's2',
        type: 'tax',
        value: 8.875,
        method: 'percentage',
      },
    ],
    total: 82.85,
  },
  {
    id: '2',
    name: 'Grocery Shopping',
    type: 'shopping',
    place: 'Whole Foods',
    date: '2024-04-08T14:20:00.000Z',
    persons: [
      { id: 'p1', name: 'John', icon: '👤' },
      { id: 'p4', name: 'Emma', icon: '👩' },
    ],
    items: [
      {
        id: 'i1',
        name: 'Vegetables',
        price: 23.45,
        splitBetween: ['p1', 'p4'],
        splitMethod: 'equal',
      },
      {
        id: 'i2',
        name: 'Snacks',
        price: 12.99,
        splitBetween: ['p4'],
        splitMethod: 'full',
      },
      {
        id: 'i3',
        name: 'Beverages',
        price: 15.99,
        splitBetween: ['p1'],
        splitMethod: 'full',
      },
    ],
    specialItems: [
      {
        id: 's1',
        type: 'tax',
        value: 5.25,
        method: 'percentage',
      },
    ],
    total: 55.18,
  },
];

export const mockRecentPeople = [
  { id: 'p1', name: 'John', icon: '👤' },
  { id: 'p2', name: 'Alice', icon: '👩' },
  { id: 'p3', name: 'Bob', icon: '👨' },
  { id: 'p4', name: 'Emma', icon: '👩' },
  { id: 'p5', name: 'Mike', icon: '🧔' },
];

export const mockRecentPlaces = [
  'La Cucina',
  'Whole Foods',
  'Starbucks',
  'Target',
  'The Local Bar',
];

export function initializeMockData() {
  // Only initialize if no data exists
  if (localStorage.getItem('bills') || localStorage.getItem('user')) {
    return;
  }

  // Initialize user data
  const user = {
    name: '',
    currency: 'USD',
    theme: 'dark',
    isSetup: false
  };
  localStorage.setItem('user', JSON.stringify(user));

  // Initialize empty bills array
  localStorage.setItem('bills', JSON.stringify([]));
}

export function resetToMockData() {
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('bills', JSON.stringify(mockBills));
  localStorage.setItem('recentPeople', JSON.stringify(mockRecentPeople));
  localStorage.setItem('recentPlaces', JSON.stringify(mockRecentPlaces));
} 