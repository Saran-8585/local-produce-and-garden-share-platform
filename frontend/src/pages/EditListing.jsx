import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';

const CATEGORIES = ['Vegetables', 'Fruits', 'Herbs', 'Seeds & Saplings', 'Flowers', 'Other'];
const UNITS = ['kg', 'g', 'bunch', 'pieces', 'pots', 'packets'];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        const l = res.data;
        if (l.user_id !== l.user_id) {
          addToast('Not authorized', 'error');
          navigate('/');
          return;
        }
        setForm({
          produce_name: l.produce_name, category: l.category, description: l.description,
          quantity: l.quantity, unit: l.unit, exchange_type: l.exchange_type,
          swap_for: l.swap_for || '', harvest_date: l.harvest_date, available_until: l.available_until,
          location_name: l.location_name, status: l.status,
        });
      } catch {
        addToast('Listing not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/listings/${id}`, {
        ...form,
        quantity: Number(form.quantity),
      });
      addToast('Listing updated!');
      navigate(`/listings/${id}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-24 text-center"><Loader2 size={32} className="animate-spin mx-auto text-primary" /></div>;
  if (!form) return null;

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Leaf size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Edit Listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Produce Name</label>
              <input type="text" value={form.produce_name} onChange={update('produce_name')} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={update('category')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Type</label>
              <select value={form.exchange_type} onChange={update('exchange_type')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none">
                <option value="Free">Free</option>
                <option value="Swap">Swap</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={update('description')} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={update('quantity')} required min={0} step="0.1"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={form.unit} onChange={update('unit')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {(form.exchange_type === 'Swap' || form.exchange_type === 'Both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Looking for</label>
              <input type="text" value={form.swap_for} onChange={update('swap_for')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
              <input type="date" value={form.harvest_date} onChange={update('harvest_date')} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
              <input type="date" value={form.available_until} onChange={update('available_until')} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={form.location_name} onChange={update('location_name')} required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary outline-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
