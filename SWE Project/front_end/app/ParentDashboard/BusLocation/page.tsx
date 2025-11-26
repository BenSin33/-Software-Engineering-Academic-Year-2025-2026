import MapView from '@/components/Layouts/MapView';

export default function BusLocationPage() {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Vị trí xe buýt</h1>
        <div
          style={{
            height: '600px',
            width: '800px',
            border: '2px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <MapView />
        </div>
      </div>
    );
  }