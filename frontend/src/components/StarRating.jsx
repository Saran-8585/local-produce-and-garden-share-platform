import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            size={size}
            className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} ${interactive ? 'hover:fill-amber-300' : ''}`}
          />
        </button>
      ))}
      {!interactive && rating > 0 && (
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}
