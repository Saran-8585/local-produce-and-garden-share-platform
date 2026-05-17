import { getExchangeColor } from '../utils/helpers';

export default function ExchangeBadge({ type }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getExchangeColor(type)}`}>
      {type}
    </span>
  );
}
