import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf size={20} className="text-primary" />
            <span className="text-sm font-semibold text-gray-700">Local Produce & Garden Share</span>
          </div>
          <p className="text-sm text-gray-500">Growing community, one harvest at a time. 🌱</p>
        </div>
      </div>
    </footer>
  );
}
