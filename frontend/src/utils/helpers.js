const CATEGORY_COLORS = {
  Vegetables: 'bg-vegetable text-white',
  Fruits: 'bg-fruit text-white',
  Herbs: 'bg-herb text-white',
  'Seeds & Saplings': 'bg-seed text-white',
  Flowers: 'bg-flower text-white',
  Other: 'bg-other text-white',
};

const CATEGORY_STRIP = {
  Vegetables: 'bg-vegetable',
  Fruits: 'bg-fruit',
  Herbs: 'bg-herb',
  'Seeds & Saplings': 'bg-seed',
  Flowers: 'bg-flower',
  Other: 'bg-other',
};

const EXCHANGE_COLORS = {
  Free: 'bg-green-100 text-green-800 border-green-300',
  Swap: 'bg-blue-100 text-blue-800 border-blue-300',
  Both: 'bg-purple-100 text-purple-800 border-purple-300',
};

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  Accepted: 'bg-green-100 text-green-800 border-green-300',
  Declined: 'bg-red-100 text-red-800 border-red-300',
  Completed: 'bg-teal-100 text-teal-800 border-teal-300',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';
}

export function getCategoryStrip(category) {
  return CATEGORY_STRIP[category] || 'bg-gray-400';
}

export function getExchangeColor(type) {
  return EXCHANGE_COLORS[type] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getFreshness(days) {
  if (days <= 3) return { color: 'text-green-600', label: `Harvested ${days} day${days === 1 ? '' : 's'} ago` };
  if (days <= 7) return { color: 'text-amber-600', label: `Harvested ${days} day${days === 1 ? '' : 's'} ago` };
  return { color: 'text-gray-500', label: `Harvested ${days} day${days === 1 ? '' : 's'} ago` };
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
