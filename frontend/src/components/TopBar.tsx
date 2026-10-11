import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Cloud, CloudRain, MapPin, Settings as SettingsIcon, Loader2, RefreshCw, X } from 'lucide-react';
import { searchLocations } from '../api';
import type { SearchResultItem, LocationInfo, WeatherInfo } from '../types';

interface TopBarProps {
  location: LocationInfo;
  weather?: WeatherInfo;
  onSelectLocation: (loc: SearchResultItem) => void;
  onOpenSettings: () => void;
  tempUnit: 'C' | 'F';
  onRefresh: () => void;
  isRefreshing: boolean;
  retrievedAt?: string;
}


export const TopBar: React.FC<TopBarProps> = ({
  location,
  weather,
  onSelectLocation,
  onOpenSettings,
  tempUnit,
  onRefresh,
  isRefreshing,
  retrievedAt,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchLocations(query.trim());
        setResults(res.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getWeatherIcon = (code?: number) => {
    if (code === undefined || code === null) return <Sun size={16} color="#f59e0b" />;
    if (code >= 51 && code <= 67) return <CloudRain size={16} color="#38bdf8" />;
    if (code >= 1 && code <= 3) return <Cloud size={16} color="#94a3b8" />;
    return <Sun size={16} color="#f59e0b" />;
  };

  const formatTemp = (celsius?: number) => {
    if (celsius === undefined || celsius === null) return '--°';
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const formatShortTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '12px 16px' : '18px 28px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(6, 8, 13, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: '12px',
    }}>
      {/* Mobile Search Overlay when opened */}
      {isMobile && isMobileSearchOpen ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            borderRadius: '24px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-focus)',
            flex: 1,
          }}>
            {isSearching ? (
              <Loader2 size={16} color="var(--accent-orange)" className="animate-spin" />
            ) : (
              <Search size={16} color="var(--accent-orange)" />
            )}
            <input
              ref={mobileInputRef}
              type="text"
              placeholder="Search city or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '14px',
                width: '100%',
              }}
            />
          </div>
          <button
            onClick={() => {
              setIsMobileSearchOpen(false);
              setQuery('');
              setIsOpen(false);
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>

          {/* Full-width Search Results Dropdown on Mobile */}
          {isOpen && results.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(14, 20, 32, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 122, 0, 0.3)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
              zIndex: 100,
              maxHeight: '320px',
              overflowY: 'auto',
            }}>
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectLocation(item);
                    setIsOpen(false);
                    setIsMobileSearchOpen(false);
                    setQuery('');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: '13px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <MapPin size={16} color="#ff7a00" style={{ flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Search Bar (Hidden on Mobile) */}
          {!isMobile && (
            <div ref={dropdownRef} style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '30px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                transition: 'border-color 0.2s ease',
              }}>
                {isSearching ? (
                  <Loader2 size={16} color="var(--accent-orange)" className="animate-spin" />
                ) : (
                  <Search size={16} color="var(--text-secondary)" />
                )}
                <input
                  type="text"
                  placeholder="Search city or location..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (results.length > 0) setIsOpen(true); }}
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

              {/* Desktop Search Results Dropdown */}
              {isOpen && results.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(14, 20, 32, 0.96)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                  zIndex: 50,
                }}>
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectLocation(item);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '13px',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 122, 0, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MapPin size={15} color="#ff7a00" />
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px', marginLeft: 'auto' }}>
                        {[item.admin1, item.country].filter(Boolean).join(', ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Left indicator on Mobile (Weather & City Name) */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {getWeatherIcon(weather?.weather_code)}
                <span>{formatTemp(weather?.temperature_c)}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: '#ffffff',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                <MapPin size={14} color="#ff7a00" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {location.name}
                </span>
              </div>
            </div>
          )}

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px', flexShrink: 0 }}>
            {/* Desktop Weather & Location (Only visible on Desktop) */}
            {!isMobile && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}>
                  {getWeatherIcon(weather?.weather_code)}
                  <span>{formatTemp(weather?.temperature_c)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}>
                  <MapPin size={15} color="#ff7a00" />
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{location.name}</span>
                  {location.country && <span>, {location.country}</span>}
                </div>
              </>
            )}

            {/* Mobile Search Icon Button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                title="Search location"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ff7a00',
                  cursor: 'pointer',
                }}
              >
                <Search size={18} />
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={retrievedAt ? `Updated at ${formatShortTime(retrievedAt)} (Click to refresh)` : "Refresh data"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isMobile ? '8px 10px' : '8px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} color={isRefreshing ? '#ff7a00' : 'currentColor'} />
              {!isMobile && <span>{isRefreshing ? 'Updating' : retrievedAt ? formatShortTime(retrievedAt) : 'Refresh'}</span>}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Settings & Provenance"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </>
      )}
    </header>
  );
};
