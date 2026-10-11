import React from 'react';
import { Home, Map as MapIcon, TrendingUp, Cpu, Settings, Wind } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '36px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ff7a00 0%, #ff4500 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(255, 122, 0, 0.35)',
        }}>
          <Wind size={20} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: '#ffffff', lineHeight: 1.2 }}>
            AirScope
          </h1>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.2px' }}>
            Breathe Better, Live Better.
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(255, 122, 0, 0.12)' : 'transparent',
                color: isActive ? '#ff7a00' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.15s ease',
                position: 'relative',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  bottom: '8px',
                  width: '3.5px',
                  backgroundColor: '#ff7a00',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 8px #ff7a00',
                }} />
              )}
              <Icon size={19} color={isActive ? '#ff7a00' : 'currentColor'} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {item.id === 'insights' && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '9px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 122, 0, 0.2)',
                  color: '#ff7a00',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}>
                  ML
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Cleaner Air Promo Widget with Animated Flowing Wind */}
      <div style={{
        marginTop: 'auto',
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(20, 27, 41, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Flowing Wind Streams in Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0.6,
        }}>
          <svg
            width="260"
            height="100"
            viewBox="0 0 260 100"
            fill="none"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Wind Stream 1 */}
            <path
              className="flowing-wind-stream-1 flowing-wind-dash"
              d="M-30 25 C30 15, 100 40, 180 20 C220 10, 260 30, 300 22"
              stroke="#57ef57ff"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            {/* Wind Stream 2 */}
            <path
              className="flowing-wind-stream-2 flowing-wind-dash"
              d="M-20 65 C40 75, 110 50, 190 70 C230 80, 270 60, 310 68"
              stroke="#77d6ffff"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
          </svg>
        </div>

        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          right: '-15px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 122, 0, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Wind size={15} color="#ff7a00" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>Cleaner air</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            brighter tomorrow
          </p>

          {/* Animated flowing wind wave below */}
          <div style={{ marginTop: '10px', height: '26px', overflow: 'hidden', position: 'relative' }}>
            <svg width="100%" height="26" viewBox="0 0 160 26" fill="none">
              <path
                className="flowing-wind-stream-1 flowing-wind-dash"
                d="M-20 12 C20 4, 60 22, 100 10 C130 4, 150 16, 180 12"
                stroke="#2da03fff"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />
              <path
                className="flowing-wind-stream-2"
                d="M-10 18 C30 10, 70 24, 110 16 C140 10, 160 20, 190 14"
                stroke="#4cc9feff"
                strokeWidth="1.2"
                strokeOpacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
};
