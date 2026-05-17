import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

const CATEGORY_MARKER_COLORS = {
  Vegetables: '#16a34a',
  Fruits: '#ea580c',
  Herbs: '#0d9488',
  'Seeds & Saplings': '#8B4513',
  Flowers: '#db2777',
  Other: '#6b7280',
};

function createMarkerIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width: 18px; height: 18px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

export default function MapView({ listings, center = [12.97, 77.65], zoom = 11, height = '500px' }) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }} className="rounded-xl z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings?.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={createMarkerIcon(CATEGORY_MARKER_COLORS[listing.category] || '#6b7280')}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{listing.produce_name}</p>
              <p className="text-gray-600">{listing.quantity} {listing.unit}</p>
              <p className="text-gray-600">
                <span className="font-medium">{listing.exchange_type}</span>
              </p>
              <Link to={`/listings/${listing.id}`} className="text-primary hover:underline text-xs mt-1 inline-block">
                View Listing →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
