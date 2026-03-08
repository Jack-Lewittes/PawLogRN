export const ACTIVITY_CONFIGS = {
  pee:         { displayName: 'Pee',          emoji: '💧',   color: '#FFCC00', isAccident: false, isTimedActivity: false },
  poo:         { displayName: 'Poo',          emoji: '💩',   color: '#996633', isAccident: false, isTimedActivity: false },
  accidentPee: { displayName: 'Accident Pee', emoji: '⚠️💧', color: '#FF9500', isAccident: true,  isTimedActivity: false },
  accidentPoo: { displayName: 'Accident Poo', emoji: '⚠️💩', color: '#FF3B30', isAccident: true,  isTimedActivity: false },
  nap:         { displayName: 'Nap',          emoji: '😴',   color: '#5856D6', isAccident: false, isTimedActivity: true  },
  feeding:     { displayName: 'Feeding',      emoji: '🍗',   color: '#34C759', isAccident: false, isTimedActivity: false },
  training:    { displayName: 'Training',     emoji: '🎯',   color: '#AF52DE', isAccident: false, isTimedActivity: true  },
};

export const ALL_TYPES = Object.keys(ACTIVITY_CONFIGS);

// Bottom-to-top order in FAB menu
export const FAB_MENU_TYPES = ['accidentPoo', 'accidentPee', 'training', 'feeding', 'nap', 'poo', 'pee'];

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Treat'];

export function getConfig(type) {
  return ACTIVITY_CONFIGS[type] || ACTIVITY_CONFIGS.pee;
}

export function feedingDisplayLine(entry) {
  if (entry.type !== 'feeding') return null;
  const food = (entry.foodType || '').trim();
  const amount = (entry.feedingAmount || '').trim();
  if (!food && !amount) return null;
  if (!food) return amount;
  if (!amount) return food;
  return `${food} · ${amount}`;
}
