import React from 'react';
import type { PollutantItem } from '../types';

interface PollutantsCardProps {
  pollutants: Record<string, PollutantItem>;
}

export const PollutantsCard: React.FC<PollutantsCardProps> = ({ pollutants }) => {
  const pollutantOrder = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];

  return (
    <div className="glass-card" style={{ padding: '24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>
          Pollutants
        </h3>

      </div>

      {/* Pollutant Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pollutantOrder.map((key) => {
          const item = pollutants[key];
          if (!item) return null;

          return (
            <div key={item.code} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 75px 65px', alignItems: 'center', gap: '12px' }}>
              {/* Pollutant Name with dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: item.status_color,
                  boxShadow: `0 0 6px ${item.status_color}`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  {item.name}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: '8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.bar_percent}%`,
                  borderRadius: '4px',
                  backgroundColor: item.status_color,
                  boxShadow: `0 0 8px ${item.status_color}88`,
                  transition: 'width 0.6s ease',
                }} />
              </div>

              {/* Numeric Concentration Value + Unit */}
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#f8fafc', fontWeight: 600 }}>
                {item.value !== null ? `${item.value} ${item.unit}` : 'N/A'}
              </div>

              {/* Status Level Badge */}
              <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: item.status_color }}>
                {item.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
