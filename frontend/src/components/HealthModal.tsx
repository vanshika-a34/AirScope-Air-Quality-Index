import React from 'react';
import { X, ShieldAlert, Wind, Home, Activity, HeartPulse, CheckCircle2 } from 'lucide-react';
import type { AirQualityCurrentResponse } from '../types';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: AirQualityCurrentResponse | null;
  locationName: string;
}

export const HealthModal: React.FC<HealthModalProps> = ({
  isOpen,
  onClose,
  currentData,
  locationName,
}) => {
  if (!isOpen) return null;

  const aqi = currentData?.aqi_value ?? 0;
  const category = currentData?.aqi_category ?? 'Air Quality Assessment';
  const categoryColor = currentData?.aqi_color ?? '#ff7a00';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(15, 20, 32, 0.96)',
          border: '1px solid rgba(255, 122, 0, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 122, 0, 0.15)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255, 122, 0, 0.4)',
              flexShrink: 0,
            }}>
              <ShieldAlert size={24} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                Health Advice & Action Guide
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {locationName}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: `${categoryColor}22`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}44`,
                }}>
                  AQI {aqi} — {category}
                </span>
              </div>
            </div>
          </div>

          {/* Close X Button */}
          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Primary Guidance Callout */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '14px',
          backgroundColor: 'rgba(255, 122, 0, 0.08)',
          border: '1px solid rgba(255, 122, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff7a00', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Current Atmospheric Recommendation
          </span>
          <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: 1.5, fontWeight: 500 }}>
            {currentData?.health_guidance || 'Air quality observations are being refreshed. Limit intense outdoor activities during peak hours.'}
          </p>
        </div>

        {/* Actionable Protective Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Pillar 1: Mask Guidance */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Wind size={16} />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Mask Protection</h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Wear certified <strong>N95 or KN95 respirators</strong> outdoors. Standard surgical or cloth masks do not filter micro particulate matter (PM2.5).
            </p>
          </div>

          {/* Pillar 2: Outdoor Exertion */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
              <Activity size={16} />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Outdoor Exercise</h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Avoid heavy cardio or sports outdoors. Deep respiration draws fine particulates deep into lung tissue. Move workouts indoors.
            </p>
          </div>

          {/* Pillar 3: Indoor Air Sanitation */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
              <Home size={16} />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Indoor Air Quality</h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Keep windows and doors shut tight. Run a <strong>HEPA air purifier</strong> in living spaces. Avoid burning candles, incense, or wood.
            </p>
          </div>

          {/* Pillar 4: Vulnerable Populations */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <HeartPulse size={16} />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Sensitive Groups</h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Children, older adults, and those with asthma or cardiac conditions should stay inside and keep prescribed rescue inhalers ready.
            </p>
          </div>
        </div>

        {/* Footer info & Done button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Source: US EPA Air Quality Guidelines
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-orange)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff7a00'}
          >
            <CheckCircle2 size={14} />
            <span>Understood</span>
          </button>
        </div>
      </div>
    </div>
  );
};
