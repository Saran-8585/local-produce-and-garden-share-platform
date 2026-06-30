import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, MessageSquare, Edit3, Trash2, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import CategoryBadge from '../components/CategoryBadge';
import ExchangeBadge from '../components/ExchangeBadge';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [offeredListing, setOfferedListing] = useState('');
  const [myListings, setMyListings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch {
        addToast('Listing not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (user && listing && user.id !== listing.user_id && (listing.exchange_type === 'Swap' || listing.exchange_type === 'Both')) {
      api.get(`/listings/user/${user.id}`).then((res) => {
        setMyListings(res.data.filter((l) => l.status === 'Available' && l.id !== listing.id));
      }).catch(() => {});
    }
    if (user && listing && user.id === listing.user_id) {
      api.get('/requests/received').then((res) => {
        setRequests(res.data.filter((r) => r.listing_id === listing.id));
      }).catch(() => {});
    }
  }, [user, listing]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/requests', {
        listing_id: listing.id,
        message: requestMsg,
        offered_listing_id: offeredListing || null,
      });
      addToast('Request sent successfully!');
      setShowRequestForm(false);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/listings/${id}`);
      addToast('Listing deleted');
      navigate('/');
    } catch {
      addToast('Failed to delete', 'error');
    }
    setShowDelete(false);
  };

  const handleToggleStatus = async () => {
    try {
      const res = await api.patch(`/listings/${id}/status`);
      setListing((prev) => ({ ...prev, status: res.data.status }));
      addToast(`Listing marked as ${res.data.status}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to toggle', 'error');
    }
  };

  if (loading) return <div className="pt-24 max-w-4xl mx-auto px-4"><LoadingSkeleton count={1} /></div>;
  if (!listing) return null;

  const isOwner = user && user.id === listing.user_id;
  const canRequest = user && !isOwner && listing.status === 'Available' && listing.days_until_expiry >= 0;
  const expired = listing.days_until_expiry < 0 || listing.status === 'Unavailable';

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{listing.produce_name}</h1>
                  {expired ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>
                  ) : (
                    <StatusBadge status={listing.status} />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={listing.category} />
                  <ExchangeBadge type={listing.exchange_type} />
                </div>
              </div>
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button onClick={handleToggleStatus} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors">
                    {listing.status === 'Available' ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} />}
                    {listing.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <Link to={`/listings/${id}/edit`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="font-medium text-gray-800">{listing.quantity} {listing.unit}</p>
                  </div>
                  {listing.swap_for && (
                    <div>
                      <p className="text-xs text-gray-400">Looking For</p>
                      <p className="font-medium text-gray-800">{listing.swap_for}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Harvest Date</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <Calendar size={14} /> {new Date(listing.harvest_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Available Until</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <Clock size={14} className={listing.days_until_expiry <= 2 ? 'text-red-500' : ''} />
                      {new Date(listing.available_until).toLocaleDateString('en-IN')}
                      {listing.days_until_expiry >= 0 && (
                        <span className={listing.days_until_expiry <= 2 ? 'text-red-500 text-sm' : 'text-gray-500 text-sm'}>
                          ({listing.days_until_expiry}d left)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-light rounded-xl p-4">
                <Link to={`/profile/${listing.user_id}`} className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                    {listing.grower_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{listing.grower_name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={12} /> {listing.grower_neighbourhood}
                    </div>
                  </div>
                </Link>
                <StarRating rating={listing.grower_rating} size={14} />
                <p className="text-xs text-gray-500 mt-2">
                  Member since {new Date(listing.grower_joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500">{listing.grower_listings} listings · {listing.grower_exchanges} exchanges</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{listing.location_name}</p>
                <p className="text-xs text-gray-500">{listing.grower_neighbourhood}</p>
              </div>
            </div>

            {isOwner && requests.length > 0 && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Requests for this listing ({requests.length})</h3>
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <Link to={`/profile/${req.requester_id}`} className="font-medium text-gray-800 hover:text-primary">{req.requester_name}</Link>
                        <p className="text-sm text-gray-500">{req.message?.slice(0, 80)}...</p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canRequest && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                {!showRequestForm ? (
                  <button onClick={() => setShowRequestForm(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
                    <MessageSquare size={18} /> Request this Produce
                  </button>
                ) : (
                  <form onSubmit={handleRequest} className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Send Request to {listing.grower_name}</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea value={requestMsg} onChange={(e) => setRequestMsg(e.target.value)} rows={3} required
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        placeholder="Tell them what you'd like and when you can pick up..." />
                    </div>
                    {(listing.exchange_type === 'Swap' || listing.exchange_type === 'Both') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Offer one of your listings (for swap)</label>
                        <select value={offeredListing} onChange={(e) => setOfferedListing(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                          <option value="">No listing offered</option>
                          {myListings.map((l) => (
                            <option key={l.id} value={l.id}>{l.produce_name} ({l.quantity} {l.unit})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button type="submit" disabled={submitting}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                        {submitting ? 'Sending...' : 'Send Request'}
                      </button>
                      <button type="button" onClick={() => setShowRequestForm(false)}
                        className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog open={showDelete} title="Delete Listing" message="Are you sure you want to delete this listing? This action cannot be undone." onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  );
}
