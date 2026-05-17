import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Leaf, Gift, ShoppingBag, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Star, History, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import ListingCard from '../components/ListingCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../utils/helpers';

const MONTHLY_TIPS = {
  0: { plant: 'Tomatoes, brinjal, chillies', harvest: 'Winter greens, carrots, peas', watch: 'Aphids on new growth' },
  1: { plant: 'Coriander, mint, leafy greens', harvest: 'Tomatoes, beans, gourds', watch: 'Powdery mildew' },
  2: { plant: 'Pumpkin, watermelon, cucumber', harvest: 'Mangoes, berries, herbs', watch: 'Fruit flies' },
  3: { plant: 'Okra, gourds, sweet potato', harvest: 'Mangoes, jackfruit, guava', watch: 'Mealybugs' },
  4: { plant: 'Brinjal, chillies, cowpea', harvest: 'Summer squash, amaranthus', watch: 'Spider mites in heat' },
  5: { plant: 'Bitter gourd, ridge gourd', harvest: 'Custard apple, pomegranate', watch: 'Whiteflies' },
  6: { plant: 'Yam, colocasia, ginger', harvest: 'Banana, papaya, coconut', watch: 'Fungal issues in rain' },
  7: { plant: 'Beans, peas, carrot', harvest: 'Brinjal, okra, chillies', watch: 'Snails and slugs' },
  8: { plant: 'Cabbage, cauliflower, beetroot', harvest: 'Guava, sapota, grapes', watch: 'Caterpillars' },
  9: { plant: 'Spinach, methi, radish', harvest: 'Pomegranate, sweet lime', watch: 'Leaf miner' },
  10: { plant: 'Peas, beans, carrot', harvest: 'Oranges, papaya, amla', watch: 'Frost damage' },
  11: { plant: 'Onion, garlic, potato', harvest: 'Winter greens, brinjal', watch: 'Root rot' },
};

export default function MyGarden() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('listings');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, listingsRes, historyRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get(`/listings/user/${user.id}`),
          api.get('/dashboard/history'),
        ]);
        setStats(statsRes.data);
        setListings(listingsRes.data);
        setHistory(historyRes.data);
      } catch {
        addToast('Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/listings/${id}/status`);
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: res.data.status } : l));
      addToast(`Listing ${res.data.status}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to toggle', 'error');
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    try {
      await api.delete(`/listings/${showDelete}`);
      setListings((prev) => prev.filter((l) => l.id !== showDelete));
      addToast('Listing deleted');
    } catch {
      addToast('Failed to delete', 'error');
    }
    setShowDelete(null);
  };

  const handleReview = async (exchangeId, revieweeId) => {
    const rating = prompt('Rate this exchange (1-5 stars):');
    if (!rating || rating < 1 || rating > 5) return addToast('Please enter a rating between 1-5', 'error');
    try {
      await api.post('/reviews', { exchange_id: exchangeId, reviewee_id: revieweeId, rating: Number(rating), comment: '' });
      addToast('Review submitted!');
      const res = await api.get('/dashboard/history');
      setHistory(res.data);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit review', 'error');
    }
  };

  const currentMonth = new Date().getMonth();
  const tip = MONTHLY_TIPS[currentMonth];

  if (loading) return <div className="pt-24 max-w-7xl mx-auto px-4"><LoadingSkeleton count={3} /></div>;

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Garden</h1>
          <Link to="/listings/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
            <Plus size={18} /> New Listing
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sprout size={18} className="text-primary" />
              <p className="text-xs text-gray-500">Active Listings</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.activeListings || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <History size={18} className="text-blue-500" />
              <p className="text-xs text-gray-500">Exchanges Done</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.completedExchanges || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Gift size={18} className="text-orange-500" />
              <p className="text-xs text-gray-500">Given Free</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.givenFree || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={18} className="text-purple-500" />
              <p className="text-xs text-gray-500">Received Free</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.receivedFree || 0}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {['listings', 'history'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'listings' ? <Sprout size={16} /> : <History size={16} />}
              {t === 'listings' ? 'My Listings' : 'Exchange History'}
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          listings.length === 0 ? (
            <EmptyState title="No listings yet" message="Create your first listing to share your garden produce!" icon={Sprout} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link to={`/listings/${listing.id}`} className="font-semibold text-gray-800 hover:text-primary">
                          {listing.produce_name}
                        </Link>
                        <p className="text-sm text-gray-500">{listing.quantity} {listing.unit}</p>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => handleToggleStatus(listing.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${listing.status === 'Available' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {listing.status === 'Available' ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                        {listing.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <Link to={`/listings/${listing.id}/edit`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit3 size={14} /> Edit
                      </Link>
                      <button onClick={() => setShowDelete(listing.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'history' && (
          history.length === 0 ? (
            <EmptyState title="No exchange history" message="Complete exchanges to see your history here." icon={History} />
          ) : (
            <div className="space-y-3">
              {history.filter((h) => h.status === 'Completed').map((h) => {
                const isOwner = user.id === h.owner_id;
                const otherPartyId = isOwner ? h.requester_id : h.owner_id;
                const otherPartyName = isOwner ? h.requester_name : h.owner_name;
                return (
                  <div key={h.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">{h.produce_name}</p>
                          <StatusBadge status={h.status} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {isOwner ? 'Given to' : 'Received from'}{' '}
                          <Link to={`/profile/${otherPartyId}`} className="text-primary hover:underline">{otherPartyName}</Link>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(h.updated_at)}</p>
                      </div>
                      {h.has_reviewed === 0 && (
                        <button onClick={() => handleReview(h.id, otherPartyId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                          <Star size={14} /> Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        <div className="mt-8 bg-gradient-to-br from-primary-light to-green-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-primary" />
            <h3 className="font-semibold text-gray-800">This Month's Garden Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">🌱 Plant</p>
              <p className="text-sm text-gray-700">{tip.plant}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">🌿 Harvest</p>
              <p className="text-sm text-gray-700">{tip.harvest}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">⚠️ Watch Out For</p>
              <p className="text-sm text-gray-700">{tip.watch}</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog open={showDelete !== null} title="Delete Listing" message="Are you sure you want to delete this listing?" onConfirm={handleDelete} onCancel={() => setShowDelete(null)} />
    </div>
  );
}
