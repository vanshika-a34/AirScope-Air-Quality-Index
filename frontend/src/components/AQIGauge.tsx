import React from 'react';
import { AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface AQIGaugeProps {
  aqiValue: number | null;
  category: string;
  categoryColor: string;
  guidanceText: string;
  onViewForecast: () => void;
  size?: number;
  alignCenter?: boolean;
  hideForecastButton?: boolean;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({
  aqiValue,
  category,
  categoryColor,
  guidanceText,
  onViewForecast,
  size = 200,
  alignCenter = false,
  hideForecastButton = false,
}) => {
  // Value mapped to 0-500 scale for arc progress
  const safeValue = aqiValue ?? 0;
  const progressRatio = Math.min(1.0, Math.max(0.0, safeValue / 400));

  // Arc calculation for SVG
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // We use a 240 degree gauge arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength * (1 - progressRatio);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: alignCenter ? 'center' : 'flex-start', gap: '16px' }}>
      {/* The Gauge Container */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(150deg)' }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Value Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={categoryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease',
              filter: `drop-shadow(0 0 10px ${categoryColor}88)`,
            }}
          />
        </svg>

        {/* Inner Content */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.8px' }}>
            AQI
          </span>
          <span style={{
            fontSize: size > 160 ? '48px' : '36px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}>
            {aqiValue !== null ? aqiValue : '—'}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: categoryColor,
              boxShadow: `0 0 8px ${categoryColor}`,
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              {category}
            </span>
          </div>
        </div>
      </div>

      {/* Health Note Capsule */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '30px',
        backgroundColor: 'rgba(255, 122, 0, 0.08)',
        border: '1px solid rgba(255, 122, 0, 0.25)',
        maxWidth: '320px',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 122, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertCircle size={14} color="#ff7a00" />
        </div>
        <p style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 500, lineHeight: 1.35 }}>
          {guidanceText}
        </p>
      </div>

      {/* View Forecast Button with Forecast Icon */}
      {!hideForecastButton && (
        <button
          onClick={onViewForecast}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '11px 20px',
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 122, 0, 0.1)',
            border: '1px solid rgba(255, 122, 0, 0.3)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            width: '230px',
            boxShadow: '0 4px 14px rgba(255, 122, 0, 0.12)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 122, 0, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.55)';
            e.currentTarget.style.color = '#ff9838';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 122, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.3)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#ff7a00" />
            <span>View Forecast</span>
          </div>
          <ArrowRight size={15} color="#ff7a00" />
        </button>
      )}
    </div>
  );
};
