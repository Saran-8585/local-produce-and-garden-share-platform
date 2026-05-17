import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Inbox, X, Check, CheckCheck, Ban } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';

export default function MyRequests() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('sent');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        api.get('/requests/sent'),
        api.get('/requests/received'),
      ]);
      setSent(sentRes.data);
      setReceived(receivedRes.data);
    } catch {
      addToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/requests/${id}/${action}`);
      addToast(`Request ${action}ed successfully`);
      fetch();
    } catch (err) {
      addToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  if (loading) return <div className="pt-24 max-w-5xl mx-auto px-4"><LoadingSkeleton type="table" /></div>;

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Requests</h1>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button onClick={() => setTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'sent' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Send size={16} /> Sent ({sent.length})
          </button>
          <button onClick={() => setTab('received')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'received' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Inbox size={16} /> Received ({received.length})
          </button>
        </div>

        {tab === 'sent' && (
          sent.length === 0 ? (
            <EmptyState title="No requests sent" message="Browse listings and request produce from your neighbours!" />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Produce</th>
                    <th className="text-left px-4 py-3 font-medium">Grower</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Message</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Offered</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sent.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/listings/${r.listing_id}`} className="font-medium text-gray-800 hover:text-primary">{r.produce_name}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.owner_name}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate hidden md:table-cell">{r.message}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.offered_produce_name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        {r.status === 'Pending' && (
                          <button onClick={() => handleAction(r.id, 'cancel')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors">
                            <X size={14} /> Cancel
                          </button>
                        )}
                        {r.status === 'Accepted' && (
                          <button onClick={() => handleAction(r.id, 'complete')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-teal-600 hover:bg-teal-50 transition-colors">
                            <Check size={14} /> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'received' && (
          received.length === 0 ? (
            <EmptyState title="No requests received" message="Your listings haven't received any requests yet." />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Requester</th>
                    <th className="text-left px-4 py-3 font-medium">Produce</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Message</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Offered</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {received.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/profile/${r.requester_id}`} className="font-medium text-gray-800 hover:text-primary">{r.requester_name}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.produce_name}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate hidden md:table-cell">{r.message}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.offered_produce_name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {r.status === 'Pending' && (
                            <>
                              <button onClick={() => handleAction(r.id, 'accept')}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-green-600 hover:bg-green-50 transition-colors">
                                <CheckCheck size={14} /> Accept
                              </button>
                              <button onClick={() => handleAction(r.id, 'decline')}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors">
                                <Ban size={14} /> Decline
                              </button>
                            </>
                          )}
                          {r.status === 'Accepted' && (
                            <button onClick={() => handleAction(r.id, 'complete')}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-teal-600 hover:bg-teal-50 transition-colors">
                              <Check size={14} /> Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
