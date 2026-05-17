import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Search, MapIcon, Grid3X3, SlidersHorizontal, Sprout } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import ListingCard from '../components/ListingCard';
import MapView from '../components/MapView';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Seeds & Saplings', 'Flowers', 'Other'];
const EXCHANGE_TYPES = ['All', 'Free', 'Swap', 'Both'];

export default function Browse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'All',
    exchange_type: 'All',
    neighbourhood: 'All',
    availability: 'Available',
    search: '',
  });
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.append(k, v); });
      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data);
      const hoods = [...new Set(res.data.map((l) => l.grower_neighbourhood).filter(Boolean))].sort();
      setNeighbourhoods(hoods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="pt-16">
      {!user && (
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
            <Leaf size={56} className="mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Local Produce & Garden Share</h1>
            <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
              Share your garden surplus, find fresh homegrown produce, and swap with neighbours in your community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-green-50 transition-colors">
                Browse Produce
              </button>
              <button onClick={() => navigate('/register')}
                className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/40">
                Join the Community
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="listings-section" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sprout size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-gray-800">
              {user ? 'Browse Listings' : 'Available Produce'}
            </h2>
            {!loading && <span className="text-sm text-gray-500">({listings.length})</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search produce..."
                className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-48 md:w-56"
              />
            </div>
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Grid3X3 size={18} />
            </button>
            <button onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <MapIcon size={18} />
            </button>
            {user && (
              <Link to="/listings/new"
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                + New Listing
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">Filters:</span>
          </div>
          <select value={filters.category} onChange={updateFilter('category')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.exchange_type} onChange={updateFilter('exchange_type')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary">
            {EXCHANGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.neighbourhood} onChange={updateFilter('neighbourhood')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary">
            <option value="All">All Areas</option>
            {neighbourhoods.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={filters.availability} onChange={updateFilter('availability')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary">
            <option value="Available">Available</option>
            <option value="All">All</option>
          </select>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : viewMode === 'map' ? (
          <MapView listings={listings} height="600px" />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="No listings found"
            message="Try adjusting your filters or check back later for new produce from your community."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
