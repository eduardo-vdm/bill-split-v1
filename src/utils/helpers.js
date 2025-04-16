export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePersonIcon() {
  const icons = ['👤', '👩', '👨', '🧑', '👱', '👴', '👵', '🧔'];
  return icons[Math.floor(Math.random() * icons.length)];
}

export function generateBillIcon(type) {
  const icons = {
    dining: ['🍽️', '🍕', '🍜', '🍣', '🍱'],
    shopping: ['🛒', '🛍️', '🏪', '🏬'],
    entertainment: ['🎬', '🎭', '🎪', '🎨'],
    transportation: ['🚗', '🚕', '🚌', '✈️'],
    utilities: ['💡', '💧', '🔌', '📱'],
    rent: ['🏠', '🏢', '🏡'],
    other: ['📝', '📦', '💼'],
  };

  const typeIcons = icons[type] || icons.other;
  return typeIcons[Math.floor(Math.random() * typeIcons.length)];
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const billTypes = [
  { id: 'dining', translationKey: 'billTypes:dining', icon: '🍽️' },
  { id: 'shopping', translationKey: 'billTypes:shopping', icon: '🛒' },
  { id: 'entertainment', translationKey: 'billTypes:entertainment', icon: '🎬' },
  { id: 'transportation', translationKey: 'billTypes:transportation', icon: '🚗' },
  { id: 'utilities', translationKey: 'billTypes:utilities', icon: '💡' },
  { id: 'rent', translationKey: 'billTypes:rent', icon: '🏠' },
  { id: 'other', translationKey: 'billTypes:other', icon: '📝' },
];

export const currencies = [
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileiro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CNY', symbol: '¥', name: '人民币' },
  { code: 'EGP', symbol: 'E£', name: 'جنيه مصري' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'भारतीय रुपया' },
  { code: 'JPY', symbol: '¥', name: '日本円' },
  { code: 'KRW', symbol: '₩', name: '대한민국 원' },
  { code: 'MXN', symbol: 'Mex$', name: 'Peso mexicano' },
  { code: 'NGN', symbol: '₦', name: 'Naira' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
].sort((a, b) => a.name.localeCompare(b.name));

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' }
];

export function generateBillSummary(bill) {
  const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
  const specialItems = bill.specialItems.map((item) => {
    const calculatedValue =
      item.method === 'percentage'
        ? (subtotal * item.value) / 100
        : item.value;
    return {
      ...item,
      calculatedValue,
    };
  });

  const totalSpecialItems = specialItems.reduce(
    (sum, item) => sum + item.calculatedValue,
    0
  );
  const total = subtotal + totalSpecialItems;

  // Calculate per-person breakdown
  const personDetails = bill.people.map((person) => {
    const items = bill.items
      .filter((item) => item.splitBetween.includes(person.id))
      .map((item) => {
        let amount;
        if (item.splitMethod === 'percentage') {
          const percentage = parseFloat(item.percentages?.[person.id] || 0);
          amount = (item.price * percentage) / 100;
        } else if (item.splitMethod === 'full') {
          amount = item.splitBetween.includes(person.id) ? item.price : 0;
        } else if (item.splitMethod === 'value') {
          amount = parseFloat(item.valueSplits?.[person.id] || 0);
        } else {
          const splitCount = item.splitBetween.length;
          amount = item.splitBetween.includes(person.id) ? item.price / splitCount : 0;
        }
        return {
          name: item.name,
          amount,
        };
      });

    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate special items share
    const specialItemsShare = specialItems.reduce((sum, item) => {
      const splitCount = bill.people.length;
      return sum + item.calculatedValue / splitCount;
    }, 0);

    return {
      id: person.id,
      name: person.name,
      icon: person.icon,
      items,
      specialItemsShare,
      total: itemsTotal + specialItemsShare,
    };
  });

  return {
    name: bill.name,
    place: bill.place,
    date: new Date(bill.date).toLocaleDateString(),
    subtotal,
    specialItems,
    total,
    personDetails,
  };
}

const calculatePersonTotal = (personId) => {
  if (!bill.items) return 0;

  return bill.items.reduce((total, item) => {
    if (!item.splitBetween?.includes(personId)) return total;

    const price = parseFloat(item.price);
    if (item.splitMethod === 'full') {
      return total + price;
    }

    if (item.splitMethod === 'percentage') {
      const percentage = parseFloat(item.percentages?.[personId] || 0);
      return total + (price * percentage) / 100;
    }

    if (item.splitMethod === 'value') {
      return total + (parseFloat(item.valueSplits?.[personId] || 0));
    }

    // Default to equal split
    const splitCount = item.splitBetween.length;
    return total + price / splitCount;
  }, 0);
}; 