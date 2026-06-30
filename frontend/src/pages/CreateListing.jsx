import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const CATEGORIES = ['Vegetables', 'Fruits', 'Herbs', 'Seeds & Saplings', 'Flowers', 'Other'];
const UNITS = ['kg', 'g', 'bunch', 'pieces', 'pots', 'packets'];

export default function CreateListing() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    produce_name: '', category: 'Vegetables', description: '', quantity: '', unit: 'kg',
    exchange_type: 'Free', swap_for: '', harvest_date: '', available_until: '',
    location_name: '', latitude: '', longitude: '', status: 'Available',
  });
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/listings', { ...form, quantity: Number(form.quantity) });
      addToast('Listing created successfully!');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Leaf size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">New Listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Produce Name *</label>
              <input type="text" value={form.produce_name} onChange={update('produce_name')} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category} onChange={update('category')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Type *</label>
              <select value={form.exchange_type} onChange={update('exchange_type')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="Free">Free</option>
                <option value="Swap">Swap</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={update('description')} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              placeholder="Growing method, variety details, taste notes..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" value={form.quantity} onChange={update('quantity')} required min={0} step="0.1"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select value={form.unit} onChange={update('unit')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {(form.exchange_type === 'Swap' || form.exchange_type === 'Both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What are you looking for in return?</label>
              <input type="text" value={form.swap_for} onChange={update('swap_for')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g., Fresh herbs, vegetable seeds, flower saplings..." />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date *</label>
              <input type="date" value={form.harvest_date} onChange={update('harvest_date')} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Until *</label>
              <input type="date" value={form.available_until} onChange={update('available_until')} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Neighbourhood *</label>
            <input type="text" value={form.location_name} onChange={update('location_name')} required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g., Koramangala 1st Block" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
