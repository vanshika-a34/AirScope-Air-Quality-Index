import React, { useState } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import type { HourlyForecastItem, DailyForecastItem } from '../types';

interface ForecastChartProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ hourly, daily }) => {
  const [range, setRange] = useState<'24h' | '5d'>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Prepare data points based on range
  let points: { label: string; aqi: number; isForecast: boolean; fullDate: string }[] = [];

  if (range === '24h') {
    // Take 24 hours from hourly data
    const subset = hourly.slice(0, 24);
    points = subset.map((h, i) => {
      const timeStr = h.time.split('T')[1]?.slice(0, 5) || `${i}:00`;
      return {
        label: timeStr,
        aqi: h.aqi_value ?? 100,
        isForecast: i > 6, // earlier hours are observed, later are forecast
        fullDate: h.time,
      };
    });
  } else {
    // 5-day daily points
    points = daily.map((d, i) => ({
      label: d.day_name,
      aqi: d.aqi_value ?? 100,
      isForecast: i > 1, // today & yesterday observed, rest forecast
      fullDate: d.date,
    }));
  }

  // Chart dimensions
  const width = 560;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxAQI = 300;

  // Generate coordinate array
  const coords = points.map((p, i) => {
    const x = paddingLeft + (i / Math.max(1, points.length - 1)) * chartW;
    const norm = Math.min(maxAQI, Math.max(0, p.aqi)) / maxAQI;
    const y = paddingTop + chartH * (1 - norm);
    return { x, y, ...p };
  });

  // Split into observed vs forecast segments
  const observedCoords = coords.filter((c) => !c.isForecast);
  const forecastCoords = coords.filter((c) => c.isForecast);
  // Include transition point
  if (observedCoords.length > 0 && forecastCoords.length > 0) {
    forecastCoords.unshift(observedCoords[observedCoords.length - 1]);
  }

  const makePath = (items: typeof coords) => {
    if (items.length === 0) return '';
    return items.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic curve
      const prev = items[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const observedPath = makePath(observedCoords);
  const forecastPath = makePath(forecastCoords);

  // Compute trend message
  const firstAqi = points[0]?.aqi ?? 0;
  const lastAqi = points[points.length - 1]?.aqi ?? 0;
  const isImproving = lastAqi < firstAqi;

  const hoveredPoint = hoverIndex !== null ? coords[hoverIndex] : coords[coords.length - 1];

  return (
    <div className="glass-card" style={{ padding: '22px 24px', flex: 1, minWidth: '320px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>AQI Forecast</h3>
          <Info size={14} color="var(--text-secondary)" />
        </div>

        {/* Range Tabs (24h and 5 Days) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '20px',
          padding: '3px',
          border: '1px solid var(--border-subtle)',
        }}>
          {(['24h', '5d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setHoverIndex(null);
              }}
              style={{
                padding: '4px 14px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: range === r ? 'var(--accent-orange)' : 'transparent',
                color: range === r ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {r === '5d' ? '5 days' : '24 hours'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Grid lines and Y axis numbers */}
          {[0, 100, 200, 300].map((level) => {
            const y = paddingTop + chartH * (1 - level / maxAQI);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="500"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Observed Line (Solid) */}
          {observedPath && (
            <path
              d={observedPath}
              fill="none"
              stroke="#ff7a00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Forecast Line (Dashed) */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#ff7a00"
              strokeWidth="2.5"
              strokeDasharray="5 5"
              strokeLinecap="round"
            />
          )}

          {/* Data Points */}
          {coords.map((c, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r="4"
                fill="#ff7a00"
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255, 122, 0, 0.8))',
                  transition: 'r 0.15s ease',
                }}
              />
              {/* X Axis Label */}
              <text
                x={c.x}
                y={height - 10}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="10"
                fontWeight="500"
              >
                {c.label}
              </text>
            </g>
          ))}

          {/* Active Hover Tooltip */}
          {hoveredPoint && (
            <g transform={`translate(${hoveredPoint.x}, ${Math.max(25, hoveredPoint.y - 45)})`}>
              <rect
                x="-42"
                y="-26"
                width="84"
                height="32"
                rx="8"
                fill="rgba(12, 16, 26, 0.95)"
                stroke="rgba(255, 122, 0, 0.5)"
                strokeWidth="1"
              />
              <text x="0" y="-13" textAnchor="middle" fill="var(--text-secondary)" fontSize="8.5" fontWeight="600">
                {hoveredPoint.label}
              </text>
              <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="700">
                AQI {hoveredPoint.aqi}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer: Legend & Trend Statement */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '11px',
      }}>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '16px', height: '2px', backgroundColor: '#ff7a00', display: 'inline-block' }} />
            <span>Observed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '16px', height: '2px', borderTop: '2px dashed #ff7a00', display: 'inline-block' }} />
            <span>Forecast</span>
          </div>
        </div>

        {/* Dynamic Trend Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isImproving ? '#22c55e' : '#f97316', fontWeight: 600 }}>
          {isImproving ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          <span>{isImproving ? 'Expected to improve over the next 2 days' : 'Elevated levels expected over the next 2 days'}</span>
        </div>
      </div>
    </div>
  );
};
