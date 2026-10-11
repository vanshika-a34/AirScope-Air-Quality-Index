import React, { useState } from 'react';
import { Wind, Menu, MapPin, ArrowLeft, Home, Map as MapIcon, TrendingUp, Cpu, Wifi, Battery, Signal } from 'lucide-react';
import type { AirQualityCurrentResponse, ForecastResponse, LocationInfo } from '../types';
import { AQIGauge } from './AQIGauge';
import { FiveDayCards } from './FiveDayCards';

interface MobileViewProps {
  currentData: AirQualityCurrentResponse | null;
  forecastData: ForecastResponse | null;
  location: LocationInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const MobileView: React.FC<MobileViewProps> = ({
  currentData,
  forecastData,
  location,
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const [subView, setSubView] = useState<'home' | 'forecast_details'>('home');

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Mon, 11 Oct 2026 • 12:30 PM';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' • ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{
      maxWidth: '390px',
      margin: '20px auto',
      borderRadius: '40px',
      overflow: 'hidden',
      backgroundColor: '#07090e',
      border: '4px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 122, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '844px',
      position: 'relative',
    }}>
      {/* iOS 9:41 Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px 8px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#ffffff',
        zIndex: 50,
      }}>
        <span>9:41</span>
        <div style={{
          width: '120px',
          height: '24px',
          borderRadius: '12px',
          backgroundColor: '#000000',
          position: 'absolute',
          left: '50%',
          top: '8px',
          transform: 'translateX(-50%)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Signal size={14} />
          <Wifi size={14} />
          <Battery size={16} />
        </div>
      </div>

      {/* Mobile Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Wind size={16} color="#ffffff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>AirScope</span>
        </div>
        <button onClick={onOpenSettings} style={{ color: 'var(--text-secondary)', padding: '4px' }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 80px' }}>
        {subView === 'home' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Location & Time */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <MapPin size={16} color="#ff7a00" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  {location.name}
                </h3>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {formatDate(currentData?.timestamp)}
              </p>
            </div>

            {/* Circular AQI Gauge */}
            <AQIGauge
              aqiValue={currentData?.aqi_value ?? null}
              category={currentData?.aqi_category ?? 'Unavailable'}
              categoryColor={currentData?.aqi_color ?? '#64748b'}
              guidanceText={currentData?.health_guidance ?? 'Loading observations...'}
              onViewForecast={() => setSubView('forecast_details')}
              size={180}
            />

            {/* Pollutants Mini Badges Row (as shown in phone home screen) */}
            {currentData && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                width: '100%',
                marginTop: '4px',
              }}>
                {[
                  { label: 'PM2.5', item: currentData.pollutants.pm25 },
                  { label: 'PM10', item: currentData.pollutants.pm10 },
                  { label: 'NO₂', item: currentData.pollutants.no2 },
                  { label: 'SO₂', item: currentData.pollutants.so2 },
                ].map(({ label, item }) => (
                  <div
                    key={label}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item?.status_color || '#22c55e' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                        {item?.value !== null ? item?.value : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* "View Full Details" Button */}
            <button
              onClick={() => setSubView('forecast_details')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: 'var(--accent-orange)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 4px 14px rgba(255, 122, 0, 0.4)',
                marginTop: '8px',
              }}
            >
              View Full Details
            </button>
          </div>
        ) : (
          /* Mobile Forecast & Pollutants View (as shown in 2nd phone mockup) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setSubView('home')} style={{ color: '#ffffff', padding: '4px' }}>
                <ArrowLeft size={18} />
              </button>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                5 Day Forecast
              </h3>
            </div>

            {/* Horizontal Forecast Cards */}
            {forecastData && (
              <div style={{ overflowX: 'auto', paddingBottom: '6px' }}>
                <FiveDayCards daily={forecastData.daily} />
              </div>
            )}

            {/* Detailed Pollutants Bars */}
            {currentData && (
              <div className="glass-card" style={{ padding: '16px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                  Pollutant Levels
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.values(currentData.pollutants).map((p) => (
                    <div key={p.code} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>{p.name}</span>
                        <span style={{ color: p.status_color, fontWeight: 700 }}>
                          {p.value !== null ? `${p.value} ${p.unit}` : 'N/A'}
                        </span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.bar_percent}%`, backgroundColor: p.status_color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (as shown in reference) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(9, 12, 19, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '12px 0 20px',
        zIndex: 50,
      }}>
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'map', label: 'Map', icon: MapIcon },
          { id: 'forecast', label: 'Forecast', icon: TrendingUp },
          { id: 'insights', label: 'Insights', icon: Cpu },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSubView('home');
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? '#ff7a00' : 'var(--text-secondary)',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
