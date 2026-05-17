import { getCategoryColor } from '../utils/helpers';

export default function CategoryBadge({ category }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
      {category}
    </span>
  );
}
