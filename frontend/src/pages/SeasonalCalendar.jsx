import { CalendarDays } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SEASONAL_DATA = {
  0: { name: 'January', produce: ['Carrots', 'Beetroot', 'Cabbage', 'Cauliflower', 'Peas', 'Spinach', 'Radish', 'Methi', 'Oranges', 'Sweet Lime'], icon: '🥬' },
  1: { name: 'February', produce: ['Tomatoes', 'Beans', 'Carrots', 'Capsicum', 'Brinjal', 'Coriander', 'Mint', 'Strawberries', 'Grapes', 'Guava'], icon: '🍅' },
  2: { name: 'March', produce: ['Mangoes (early)', 'Watermelon', 'Muskmelon', 'Cucumber', 'Pumpkin', 'Bottle Gourd', 'Chillies', 'Okra', 'Jackfruit', 'Coconut'], icon: '🥭' },
  3: { name: 'April', produce: ['Mangoes', 'Jackfruit', 'Lychee', 'Watermelon', 'Okra', 'Gourds', 'Brinjal', 'Cowpea', 'Amaranthus', 'Curry Leaves'], icon: '☀️' },
  4: { name: 'May', produce: ['Mangoes', 'Jackfruit', 'Banana', 'Papaya', 'Bitter Gourd', 'Ridge Gourd', 'Brinjal', 'Chillies', 'Coconut', 'Lemon'], icon: '🌴' },
  5: { name: 'June', produce: ['Bitter Gourd', 'Ridge Gourd', 'Snake Gourd', 'Brinjal', 'Okra', 'Banana', 'Custard Apple', 'Pomegranate', 'Curry Leaves', 'Tulsi'], icon: '🌧️' },
  6: { name: 'July', produce: ['Yam', 'Colocasia', 'Ginger', 'Turmeric', 'Brinjal', 'Okra', 'Banana', 'Papaya', 'Lemon', 'Coconut'], icon: '🌱' },
  7: { name: 'August', produce: ['Beans', 'Peas', 'Carrots', 'Cabbage', 'Cauliflower', 'Brinjal', 'Okra', 'Chillies', 'Pomegranate', 'Sapota'], icon: '🌿' },
  8: { name: 'September', produce: ['Cabbage', 'Cauliflower', 'Beetroot', 'Carrots', 'Spinach', 'Methi', 'Coriander', 'Guava', 'Sapota', 'Grapes'], icon: '🌾' },
  9: { name: 'October', produce: ['Spinach', 'Methi', 'Radish', 'Carrots', 'Peas', 'Coriander', 'Mint', 'Pomegranate', 'Sweet Lime', 'Amla'], icon: '🍂' },
  10: { name: 'November', produce: ['Peas', 'Beans', 'Carrots', 'Cabbage', 'Cauliflower', 'Spinach', 'Radish', 'Oranges', 'Papaya', 'Amla'], icon: '🍊' },
  11: { name: 'December', produce: ['Carrots', 'Beetroot', 'Peas', 'Cabbage', 'Cauliflower', 'Spinach', 'Methi', 'Sweet Lime', 'Guava', 'Strawberries'], icon: '❄️' },
};

export default function SeasonalCalendar() {
  const currentMonth = new Date().getMonth();

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <CalendarDays size={28} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Seasonal Availability Calendar</h1>
            <p className="text-gray-500 text-sm">What's in season in Bangalore right now</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map((month, i) => {
            const data = SEASONAL_DATA[i];
            const isCurrent = i === currentMonth;
            return (
              <div
                key={i}
                className={`rounded-2xl p-5 border transition-all ${
                  isCurrent
                    ? 'bg-primary text-white border-primary ring-2 ring-primary/30 shadow-lg scale-[1.02]'
                    : 'bg-white text-gray-800 border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{month}</h3>
                  <span className="text-2xl">{data.icon}</span>
                </div>
                {isCurrent && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mb-2">
                    Current Month
                  </span>
                )}
                <ul className="space-y-1">
                  {data.produce.map((item) => (
                    <li key={item} className={`text-sm flex items-center gap-1.5 ${isCurrent ? 'text-green-50' : 'text-gray-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-primary'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">About This Calendar</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This calendar shows the typical seasonal availability of common fruits, vegetables, and herbs in the Bangalore region.
            Actual availability may vary based on weather, growing conditions, and individual garden practices.
            Use this as a guide to know what to expect when browsing listings or planning your garden.
          </p>
        </div>
      </div>
    </div>
  );
}
