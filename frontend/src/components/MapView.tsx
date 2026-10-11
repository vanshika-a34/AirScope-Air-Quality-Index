import React, { useState, useEffect } from 'react';
import { Search, Compass, Loader2, RefreshCw } from 'lucide-react';
import type { LocationInfo, RegionalCityItem } from '../types';
import { fetchRegionalCities } from '../api';

interface MapViewProps {
  currentLocation: LocationInfo;
  onSelectCity: (name: string, lat: number, lon: number, country: string) => void;
  isMobile?: boolean;
}

// Relative percentage coordinates for placing regional cities on the dark map canvas
const CITY_MAP_COORDS: Record<string, { x: number; y: number }> = {
  Delhi: { x: 54, y: 32 },
  Lahore: { x: 44, y: 24 },
  Karachi: { x: 28, y: 54 },
  Mumbai: { x: 41, y: 62 },
  Kolkata: { x: 78, y: 48 },
  Bengaluru: { x: 53, y: 82 },
  Chennai: { x: 58, y: 84 },
};

export const MapView: React.FC<MapViewProps> = ({ currentLocation, onSelectCity, isMobile: propIsMobile }) => {
  const isMobile = propIsMobile !== undefined ? propIsMobile : (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [metric, setMetric] = useState<'AQI' | 'PM2.5' | 'PM10'>('AQI');
  const [filterQuery, setFilterQuery] = useState('');
  const [cities, setCities] = useState<RegionalCityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [retrievedAt, setRetrievedAt] = useState<string>('');

  const loadCities = async () => {
    setLoading(true);
    try {
      const res = await fetchRegionalCities();
      setCities(res.cities);
      setRetrievedAt(res.retrieved_at);
    } catch (err) {
      console.error('Failed to load regional cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getMetricValue = (c: RegionalCityItem) => {
    if (metric === 'PM2.5') return c.pm25 !== null ? `${Math.round(c.pm25)} μg` : 'N/A';
    if (metric === 'PM10') return c.pm10 !== null ? `${Math.round(c.pm10)} μg` : 'N/A';
    return c.aqi_value !== null ? c.aqi_value : '—';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: isMobile ? '0 16px 28px' : '0 28px 28px' }}>
      {/* Top Map Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          borderRadius: '24px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          width: isMobile ? '100%' : '320px',
        }}>
          <Search size={15} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Filter map cities..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>

        {/* Right side: Metric Selector Pills & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '20px',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
          }}>
            {(['AQI', 'PM2.5', 'PM10'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: metric === m ? 'var(--accent-orange)' : 'transparent',
                  color: metric === m ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={loadCities}
            disabled={loading}
            title="Refresh regional cities"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map Canvas + Major Cities List */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Dark Map Canvas */}
        <div
          className="glass-card"
          style={{
            position: 'relative',
            height: isMobile ? '380px' : '460px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at center, #0c1424 0%, #060910 100%)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Subtle Topographical Grid Pattern */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Subcontinent Landmass SVG Outline */}
          <svg
            viewBox="0 0 800 600"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.35,
            }}
          >
            <path
              d="M 220 180 Q 280 120 380 100 Q 500 90 620 140 Q 690 190 710 270 Q 720 340 680 400 Q 640 460 550 510 Q 480 540 430 460 Q 380 400 320 360 Q 240 320 220 240 Z"
              fill="rgba(30, 41, 59, 0.4)"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Compass Widget */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(14, 20, 32, 0.8)',
            border: '1px solid var(--border-subtle)',
          }}>
            <Compass size={20} color="#ff7a00" />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(12, 16, 26, 0.85)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}>
              <Loader2 size={13} className="animate-spin" color="#ff7a00" />
              <span>Fetching live sensor observations...</span>
            </div>
          )}

          {/* Genuine City Nodes on Map */}
          {filteredCities.map((c) => {
            const isSelected = currentLocation.name.toLowerCase() === c.name.toLowerCase();
            const coord = CITY_MAP_COORDS[c.name] || { x: 50, y: 50 };

            return (
              <div
                key={c.name}
                onClick={() => onSelectCity(c.name, c.latitude, c.longitude, c.country)}
                style={{
                  position: 'absolute',
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Marker Glowing Ring */}
                <div style={{
                  position: 'relative',
                  width: isSelected ? '32px' : '22px',
                  height: isSelected ? '32px' : '22px',
                  borderRadius: '50%',
                  border: `2px solid ${c.aqi_color}`,
                  backgroundColor: 'rgba(12, 16, 26, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 16px ${c.aqi_color}aa`,
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: isSelected ? '10px' : '8px',
                    height: isSelected ? '10px' : '8px',
                    borderRadius: '50%',
                    backgroundColor: c.aqi_color,
                  }} />
                </div>

                {/* City Tag with Genuine Live Metric */}
                <div style={{
                  marginTop: '4px',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(12, 16, 26, 0.88)',
                  border: `1px solid ${isSelected ? '#ff7a00' : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(8px)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: c.aqi_color, marginLeft: '6px' }}>
                    {getMetricValue(c)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Major Cities Ranking Card (Desktop only) */}
        {!isMobile && (
          <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Major Cities
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Live Observations
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cities.map((c) => {
                const isSelected = currentLocation.name.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    onClick={() => onSelectCity(c.name, c.latitude, c.longitude, c.country)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(255, 122, 0, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? '#ff7a00' : 'rgba(255, 255, 255, 0.05)'}`,
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: c.aqi_color,
                        boxShadow: `0 0 6px ${c.aqi_color}`,
                      }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', display: 'block' }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {c.aqi_category}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: c.aqi_color }}>
                        {getMetricValue(c)}
                      </span>
                      {c.critical_pollutant && (
                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)' }}>
                          {c.critical_pollutant}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Promo Banner Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', alignItems: 'center' }}>
        {/* Category Legend */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { label: 'Good (0-50)', color: '#22c55e' },
            { label: 'Moderate (51-100)', color: '#eab308' },
            { label: 'Poor (101-150)', color: '#ff7a00' },
            { label: 'Unhealthy (151-200)', color: '#ef4444' },
            { label: 'Very Poor (201-300)', color: '#a855f7' },
            { label: 'Severe (301+)', color: '#991b1b' },
          ].map((leg) => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: leg.color, boxShadow: `0 0 6px ${leg.color}` }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{leg.label}</span>
            </div>
          ))}
        </div>

        {/* Clean Air Promo Card */}
        <div
          className="glass-card"
          style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(20, 28, 44, 0.9) 0%, rgba(12, 17, 28, 0.95) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
              Clean Air. Healthy Tomorrow.
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Track air quality, explore forecasts, and take steps for a healthier you.
            </p>
            {retrievedAt && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Source: Open-Meteo • Live Regional Monitoring
              </span>
            )}
          </div>
          <button
            onClick={() => onSelectCity('Delhi', 28.6139, 77.2090, 'India')}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              backgroundColor: 'var(--accent-orange)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(255, 122, 0, 0.35)',
            }}
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};
