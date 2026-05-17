import { Link } from 'react-router-dom';
import { MapPin, Clock, Calendar } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import ExchangeBadge from './ExchangeBadge';
import StarRating from './StarRating';
import { getCategoryStrip, getFreshness, formatDate } from '../utils/helpers';

const STATUS_COLOR = {
  Available: 'bg-green-100 text-green-800',
  Unavailable: 'bg-gray-100 text-gray-500',
};

export default function ListingCard({ listing }) {
  const freshness = getFreshness(listing.days_since_harvest);
  const expiresSoon = listing.days_until_expiry <= 2 && listing.days_until_expiry >= 0;
  const expired = listing.days_until_expiry < 0 || listing.status === 'Unavailable';
  const statusColor = expired ? STATUS_COLOR.Unavailable : STATUS_COLOR.Available;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
    >
      <div className={`h-2 ${getCategoryStrip(listing.category)}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
            {listing.produce_name}
          </h3>
          {expired ? (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              Expired
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {listing.status}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={listing.category} />
          <ExchangeBadge type={listing.exchange_type} />
        </div>

        <div className="space-y-1.5 mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{listing.quantity}</span> {listing.unit}
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            {listing.grower_neighbourhood}
          </div>
          <div className="flex items-center gap-1 text-sm" title={formatDate(listing.harvest_date)}>
            <Calendar size={14} className={freshness.color} />
            <span className={freshness.color}>{freshness.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {listing.grower_name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{listing.grower_name}</p>
              <StarRating rating={listing.grower_rating} size={12} />
            </div>
          </div>
          {!expired && (
            <div className="flex items-center gap-1 text-xs" title={formatDate(listing.available_until)}>
              <Clock size={12} className={expiresSoon ? 'text-red-500' : 'text-gray-400'} />
              <span className={expiresSoon ? 'text-red-500 font-medium' : 'text-gray-500'}>
                {expiresSoon ? `${listing.days_until_expiry}d left` : `${listing.days_until_expiry}d`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
