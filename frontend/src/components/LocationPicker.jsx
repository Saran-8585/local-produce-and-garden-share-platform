import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';

const defaultIcon = L.divIcon({
  className: 'custom-marker-draggable',
  html: `<div style="width: 24px; height: 24px; background: #15803d; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function DraggableMarker({ position, onPositionChange }) {
  const marker = L.marker(position, { icon: defaultIcon, draggable: true });

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  useEffect(() => {
    marker.on('dragend', () => {
      const latlng = marker.getLatLng();
      onPositionChange({ lat: latlng.lat, lng: latlng.lng });
    });
    return () => marker.off();
  }, []);

  return (
    <Marker
      position={position}
      draggable={true}
      icon={defaultIcon}
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          onPositionChange({ lat: latlng.lat, lng: latlng.lng });
        },
      }}
    />
  );
}

export default function LocationPicker({ position, onPositionChange }) {
  const [center] = useState(position || [12.97, 77.65]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={13} style={{ height: '300px', width: '100%' }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <DraggableMarker
            position={[position.lat, position.lng]}
            onPositionChange={onPositionChange}
          />
        )}
      </MapContainer>
      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 flex gap-4">
        <span>Lat: {position?.lat?.toFixed(4) || '—'}</span>
        <span>Lng: {position?.lng?.toFixed(4) || '—'}</span>
      </div>
    </div>
  );
}
