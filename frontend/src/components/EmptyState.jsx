import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title = 'Nothing here yet', message = 'Check back later for new listings' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon size={64} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-gray-400 text-center max-w-md">{message}</p>
    </div>
  );
}
