export function calculateItemSplit(item, persons) {
  const { price, splitBetween, splitMethod } = item;
  const splits = {};

  switch (splitMethod) {
    case 'equal':
      const perPerson = price / splitBetween.length;
      splitBetween.forEach((personId) => {
        splits[personId] = perPerson;
      });
      break;

    case 'percentage':
      splitBetween.forEach((split) => {
        splits[split.personId] = (price * split.percentage) / 100;
      });
      break;

    case 'custom':
      splitBetween.forEach((split) => {
        splits[split.personId] = split.amount;
      });
      break;

    case 'full':
      splits[splitBetween[0]] = price;
      break;

    default:
      throw new Error(`Unknown split method: ${splitMethod}`);
  }

  return splits;
}

export function calculateSpecialItemValue(specialItem, subtotal) {
  const { type, value, method } = specialItem;
  
  if (method === 'percentage') {
    return (subtotal * value) / 100;
  }
  
  return value; // Fixed amount
}

export function calculateBillTotals(bill) {
  const { items, specialItems, persons } = bill;
  
  // Calculate subtotal from regular items
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate special items (tax, tip, etc.)
  const specialItemsTotals = specialItems.map((item) => ({
    ...item,
    calculatedValue: calculateSpecialItemValue(item, subtotal),
  }));
  
  const specialItemsTotal = specialItemsTotals.reduce(
    (sum, item) => sum + item.calculatedValue,
    0
  );
  
  // Calculate per-person splits
  const personTotals = {};
  persons.forEach((person) => {
    personTotals[person.id] = {
      items: [],
      regularTotal: 0,
      specialItemsShare: 0,
      total: 0,
    };
  });

  // Add regular items to person totals
  items.forEach((item) => {
    const splits = calculateItemSplit(item, persons);
    Object.entries(splits).forEach(([personId, amount]) => {
      if (personTotals[personId]) {
        personTotals[personId].items.push({
          name: item.name,
          amount,
        });
        personTotals[personId].regularTotal += amount;
      }
    });
  });

  // Calculate special items share per person
  const totalParticipants = persons.length;
  const specialItemsPerPerson = specialItemsTotal / totalParticipants;

  // Add special items share to person totals
  Object.values(personTotals).forEach((personTotal) => {
    personTotal.specialItemsShare = specialItemsPerPerson;
    personTotal.total = personTotal.regularTotal + personTotal.specialItemsShare;
  });

  return {
    subtotal,
    specialItems: specialItemsTotals,
    specialItemsTotal,
    total: subtotal + specialItemsTotal,
    perPerson: personTotals,
  };
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function generateBillSummary(bill) {
  const totals = calculateBillTotals(bill);
  
  return {
    ...totals,
    date: new Date(bill.date).toLocaleDateString(),
    place: bill.place,
    personDetails: Object.entries(totals.perPerson).map(([personId, details]) => {
      const person = bill.persons.find((p) => p.id === personId);
      return {
        id: personId,
        name: person.name,
        icon: person.icon,
        ...details,
      };
    }),
  };
} 