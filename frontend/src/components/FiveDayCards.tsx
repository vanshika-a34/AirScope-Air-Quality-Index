import React from 'react';
import { Sun, Cloud, CloudRain, Info } from 'lucide-react';
import type { DailyForecastItem } from '../types';

interface FiveDayCardsProps {
  daily: DailyForecastItem[];
  tempUnit?: 'C' | 'F';
  isMobile?: boolean;
}

export const FiveDayCards: React.FC<FiveDayCardsProps> = ({ daily, tempUnit = 'C', isMobile: propIsMobile }) => {
  const isMobile = propIsMobile !== undefined ? propIsMobile : (typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  const getWeatherIcon = (code?: number) => {
    if (code === undefined || code <= 1) return <Sun size={15} color="#ffb703" />;
    if (code <= 3) return <Cloud size={15} color="#94a3b8" />;
    return <CloudRain size={15} color="#38bdf8" />;
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const dt = new Date(dateStr + 'T12:00:00');
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTemp = (celsius?: number) => {
    if (celsius === undefined) return '32°';
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const renderCard = (item: DailyForecastItem, idx: number) => {
    const isToday = idx === 0;
    return (
      <div
        key={item.date}
        className="glass-card"
        style={{
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderColor: isToday ? 'rgba(255, 122, 0, 0.4)' : 'var(--border-subtle)',
          backgroundColor: isToday ? 'rgba(255, 122, 0, 0.06)' : 'var(--bg-card)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isToday ? 'rgba(255, 122, 0, 0.4)' : 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Day Header */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            {item.day_name}
          </h4>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px' }}>
            {formatShortDate(item.date)}
          </p>
        </div>

        {/* AQI Value */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: item.aqi_color,
            boxShadow: `0 0 8px ${item.aqi_color}`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {item.aqi_value ?? '—'}
          </span>
        </div>

        {/* Category Name */}
        <span style={{ fontSize: '11px', fontWeight: 600, color: item.aqi_color, lineHeight: 1 }}>
          {item.aqi_category}
        </span>

        {/* Weather & Temperatures */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}>
          {getWeatherIcon(item.weather_code)}
          <span>
            {formatTemp(item.temp_max_c)}
            {' / '}
            {formatTemp(item.temp_min_c)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {!isMobile ? (
        /* 5 Cards Row (Desktop) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
        }}>
          {daily.slice(0, 5).map((item, idx) => renderCard(item, idx))}
        </div>
      ) : (
        /* 3 Layers Layout (Mobile) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Layer 1: Today in middle */}
          {daily[0] && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '280px' }}>
                {renderCard(daily[0], 0)}
              </div>
            </div>
          )}

          {/* Layer 2: Next 2 days */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {daily[1] && renderCard(daily[1], 1)}
            {daily[2] && renderCard(daily[2], 2)}
          </div>

          {/* Layer 3: Next 2 days */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {daily[3] && renderCard(daily[3], 3)}
            {daily[4] && renderCard(daily[4], 4)}
          </div>
        </div>
      )}

      {/* Official Attribution Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        paddingLeft: '4px',
      }}>
        <Info size={13} color="var(--text-muted)" />
        <span>Forecast from Open-Meteo | 5-day forecast</span>
      </div>
    </div>
  );
};
