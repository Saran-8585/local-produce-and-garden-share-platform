import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Sprout, History, Gift, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import StarRating from '../components/StarRating';
import ListingCard from '../components/ListingCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';

export default function GrowerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profileRes, listingsRes, reviewsRes] = await Promise.all([
          api.get(`/profile/${id}`),
          api.get(`/listings/user/${id}`),
          api.get(`/reviews/user/${id}`),
        ]);
        setProfile(profileRes.data);
        setListings(listingsRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="pt-24 max-w-5xl mx-auto px-4"><LoadingSkeleton count={2} /></div>;
  if (!profile) return <div className="pt-24 text-center text-gray-500">Profile not found</div>;

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Browse
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                <span className="flex items-center gap-1"><MapPin size={14} /> {profile.neighbourhood}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Member since {formatDate(profile.created_at)}</span>
              </div>
              <StarRating rating={profile.avg_rating} size={16} />
              {profile.bio && <p className="text-gray-600 mt-3">{profile.bio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{profile.total_listings}</p>
              <p className="text-xs text-gray-500">Total Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{profile.total_exchanges}</p>
              <p className="text-xs text-gray-500">Exchanges Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{profile.total_reviews}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Active Listings ({listings.filter((l) => l.status === 'Available').length})
        </h2>
        {listings.filter((l) => l.status === 'Available').length === 0 ? (
          <EmptyState title="No active listings" message="This grower has no active listings right now." icon={Sprout} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {listings.filter((l) => l.status === 'Available').map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews Received ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/profile/${review.reviewer_id}`} className="font-medium text-gray-800 hover:text-primary">
                        {review.reviewer_name}
                      </Link>
                      <p className="text-xs text-gray-400">{review.reviewer_neighbourhood}</p>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 mt-2">"{review.comment}"</p>}
                  <p className="text-xs text-gray-400 mt-2">on {review.produce_name} · {formatDate(review.created_at)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
