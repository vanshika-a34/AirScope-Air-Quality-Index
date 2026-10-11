import React from 'react';
import { ShieldAlert, ChevronRight } from 'lucide-react';

interface HealthAdviceCardProps {
  adviceText: string;
  source: string;
  onClick?: () => void;
}

export const HealthAdviceCard: React.FC<HealthAdviceCardProps> = ({ adviceText, source, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="glass-card"
      style={{
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.35)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Orange Icon Circle */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(255, 122, 0, 0.4)',
        flexShrink: 0,
      }}>
        <ShieldAlert size={22} color="#ffffff" />
      </div>

      {/* Advice Text */}
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
          Health Advice
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {adviceText}
        </p>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
          Source: {source}
        </span>
      </div>

      {/* Right Action Callout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#ff7a00',
        padding: '6px 10px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 122, 0, 0.08)',
        border: '1px solid rgba(255, 122, 0, 0.2)',
        flexShrink: 0,
      }}>
        <span>Precautions</span>
        <ChevronRight size={14} color="#ff7a00" />
      </div>
    </div>
  );
};
