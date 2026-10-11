import React from 'react';

interface EarthHeroProps {
  cityName: string;
  aqiValue: number | null;
  category: string;
  categoryColor: string;
}

export const EarthHero: React.FC<EarthHeroProps> = ({
  cityName,
  aqiValue,
  category,
  categoryColor,
}) => {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '360px',
      overflow: 'visible',
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 122, 0, 0.16) 0%, rgba(255, 122, 0, 0.05) 45%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Earth Image */}
      <img
        src="/earth-hero.png"
        alt="Earth Atmosphere Visualization"
        style={{
          width: '390px',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '50%',
          boxShadow: '0 0 50px rgba(255, 122, 0, 0.22), inset 0 0 30px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          zIndex: 2,
          display: 'block',
        }}
      />

      {/* Pulsing Target Marker on Selected Location */}
      <div style={{
        position: 'absolute',
        top: '46%',
        left: '52%',
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Outer Ring */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '2px solid #ffffff',
          boxShadow: '0 0 14px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 122, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Inner Core */}
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px #ffffff',
          }} />
        </div>

        {/* Floating Tooltip Tag */}
        <div style={{
          position: 'absolute',
          top: '38px',
          left: '50px',
          padding: '8px 14px',
          borderRadius: '12px',
          backgroundColor: 'rgba(12, 16, 26, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          minWidth: '100px',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>{cityName}</p>
          <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
            AQI {aqiValue !== null ? aqiValue : '—'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: categoryColor,
              boxShadow: `0 0 6px ${categoryColor}`,
            }} />
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
