import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AQIGauge } from './components/AQIGauge';
import { EarthHero } from './components/EarthHero';
import { PollutantsCard } from './components/PollutantsCard';
import { HealthAdviceCard } from './components/HealthAdviceCard';
import { ForecastChart } from './components/ForecastChart';
import { FiveDayCards } from './components/FiveDayCards';
import { MapView } from './components/MapView';
import { AIExperimentalView } from './components/AIExperimentalView';
import { SettingsView } from './components/SettingsView';
import { HealthModal } from './components/HealthModal';
import { fetchCurrentAirQuality, fetchForecastData } from './api';
import type { AirQualityCurrentResponse, ForecastResponse, LocationInfo, SearchResultItem } from './types';
import { AlertCircle, RefreshCw, MapPin, Home, Map as MapIcon, TrendingUp, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);

  // Temperature unit preference persisted in localStorage
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('airscope_temp_unit') as 'C' | 'F') || 'C';
  });

  // Default to Delhi per design reference and project requirements
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    name: 'Delhi',
    admin1: 'National Capital Territory of Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  });

  const [currentData, setCurrentData] = useState<AirQualityCurrentResponse | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen to screen width to toggle mobile mode automatically
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch real data on location change
  const loadData = useCallback(async (loc: LocationInfo, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [aqRes, fcRes] = await Promise.all([
        fetchCurrentAirQuality(loc.latitude, loc.longitude, loc.name, loc.admin1, loc.country),
        fetchForecastData(loc.latitude, loc.longitude, loc.name, loc.admin1, loc.country),
      ]);
      setCurrentData(aqRes);
      setForecastData(fcRes);
    } catch (err: any) {
      console.error('Data loading error:', err);
      setError(err.message || 'Unable to load real-time environmental data. Please verify your connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentLocation);
  }, [currentLocation, loadData]);

  // Auto-refresh interval based on user settings
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    const mins = Number(localStorage.getItem('airscope_refresh_interval')) || 0;
    if (mins > 0) {
      autoRefreshRef.current = setInterval(() => {
        loadData(currentLocation, true);
      }, mins * 60 * 1000);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [currentLocation, loadData]);

  const handleRefresh = useCallback(() => {
    loadData(currentLocation, true);
  }, [currentLocation, loadData]);

  const handleSelectLocation = (item: SearchResultItem) => {
    const newLoc: LocationInfo = {
      name: item.name,
      admin1: item.admin1,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'UTC',
    };
    setCurrentLocation(newLoc);
  };

  const handleSelectCityFromMap = (name: string, lat: number, lon: number, country: string) => {
    const newLoc: LocationInfo = {
      name,
      country,
      latitude: lat,
      longitude: lon,
      timezone: 'UTC',
    };
    setCurrentLocation(newLoc);
    setActiveTab('home');
  };

  const formatObservationDate = (isoString?: string) => {
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

  // Shared content renderer for both mobile and desktop (views other than home)
  const renderActiveView = () => {
    if (activeTab === 'map') {
      return (
        <MapView
          currentLocation={currentLocation}
          onSelectCity={handleSelectCityFromMap}
          isMobile={isMobile}
        />
      );
    }

    if (activeTab === 'insights') {
      return <AIExperimentalView onBack={() => setActiveTab('home')} isMobile={isMobile} />;
    }

    if (activeTab === 'settings') {
      return (
        <SettingsView
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
          onRefreshData={handleRefresh}
        />
      );
    }

    if (activeTab === 'forecast') {
      return (
        <div style={{ padding: isMobile ? '0 16px 28px' : '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: '#ffffff' }}>
            5-Day Atmospheric Forecast
          </h2>
          {forecastData && (
            <>
              <ForecastChart hourly={forecastData.hourly} daily={forecastData.daily} />
              <FiveDayCards daily={forecastData.daily} tempUnit={tempUnit} isMobile={isMobile} />
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Desktop Sidebar (hidden on mobile) */}
      {!isMobile && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Main Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: isMobile ? '72px' : 0,
      }}>
        {/* Top Header Bar */}
        <TopBar
          location={currentLocation}
          weather={currentData?.weather}
          onSelectLocation={handleSelectLocation}
          onOpenSettings={() => setActiveTab('settings')}
          tempUnit={tempUnit}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          retrievedAt={currentData?.retrieved_at}
        />

        {/* Network / Provider Error Fallback State */}
        {error && (
          <div style={{
            margin: isMobile ? '12px 16px' : '16px 28px',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} color="#ef4444" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
                  Live Data Unavailable
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          {/* Non-home views (shared between mobile and desktop) */}
          {activeTab !== 'home' && renderActiveView()}

          {/* ─── HOME VIEW ─── */}
          {activeTab === 'home' && (
            <>
              {/* ── DESKTOP Home: 3-column grid (unchanged) ── */}
              {!isMobile && (
                <div style={{
                  padding: '0 28px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  minHeight: 'calc(100vh - 120px)',
                  justifyContent: 'center',
                }}>
                  {/* Hero Grid: Location & AQI Gauge (left) | Glowing Earth (center) | Pollutants & Health (right) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 340px) 1fr minmax(320px, 360px)',
                    gap: '28px',
                    alignItems: 'center',
                  }}>
                    {/* Left Column: Location, Local Time & AQI Gauge with View Forecast button */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--accent-orange)',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                        }}>
                          Real-Time Air Quality
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <MapPin size={20} color="#ff7a00" />
                          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px' }}>
                            {currentLocation.name}
                          </h2>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                          {formatObservationDate(currentData?.timestamp)}
                        </p>
                      </div>

                      {/* Circular AQI Dial Gauge + View Forecast button */}
                      <AQIGauge
                        aqiValue={currentData?.aqi_value ?? null}
                        category={currentData?.aqi_category ?? (loading ? 'Loading...' : 'Unavailable')}
                        categoryColor={currentData?.aqi_color ?? '#64748b'}
                        guidanceText={currentData?.health_guidance ?? (loading ? 'Fetching atmospheric observations...' : 'Data unavailable.')}
                        onViewForecast={() => setActiveTab('forecast')}
                        size={220}
                      />
                    </div>

                    {/* Center Column: Glowing Earth Visual */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <EarthHero
                        cityName={currentLocation.name}
                        aqiValue={currentData?.aqi_value ?? null}
                        category={currentData?.aqi_category ?? (loading ? 'Loading...' : 'Unavailable')}
                        categoryColor={currentData?.aqi_color ?? '#ff7a00'}
                      />
                    </div>

                    {/* Right Column: Pollutants Card & Health Advice */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {currentData ? (
                        <PollutantsCard
                          pollutants={currentData.pollutants}
                        />
                      ) : (
                        <div className="glass-card skeleton" style={{ height: '240px' }} />
                      )}

                      <HealthAdviceCard
                        adviceText={currentData?.health_guidance ?? 'Limit prolonged outdoor activity, especially for sensitive groups.'}
                        source={currentData?.health_guidance_source ?? 'US EPA Air Quality Guidelines'}
                        onClick={() => setIsHealthModalOpen(true)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── MOBILE Home: responsive single-column layout ── */}
              {isMobile && (
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  {/* Location & Time */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--accent-orange)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}>
                      Real-Time Air Quality
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={18} color="#ff7a00" />
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px' }}>
                        {currentLocation.name}
                      </h2>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                      {formatObservationDate(currentData?.timestamp)}
                    </p>
                  </div>

                  {/* AQI Gauge — centered */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <AQIGauge
                      aqiValue={currentData?.aqi_value ?? null}
                      category={currentData?.aqi_category ?? (loading ? 'Loading...' : 'Unavailable')}
                      categoryColor={currentData?.aqi_color ?? '#64748b'}
                      guidanceText={currentData?.health_guidance ?? (loading ? 'Fetching atmospheric observations...' : 'Data unavailable.')}
                      onViewForecast={() => setActiveTab('forecast')}
                      size={180}
                      alignCenter
                    />
                  </div>

                  {/* Earth Visual — smaller on mobile */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <EarthHero
                      cityName={currentLocation.name}
                      aqiValue={currentData?.aqi_value ?? null}
                      category={currentData?.aqi_category ?? (loading ? 'Loading...' : 'Unavailable')}
                      categoryColor={currentData?.aqi_color ?? '#ff7a00'}
                    />
                  </div>

                  {/* Pollutants Card */}
                  {currentData ? (
                    <PollutantsCard pollutants={currentData.pollutants} />
                  ) : (
                    <div className="glass-card skeleton" style={{ height: '200px' }} />
                  )}

                  {/* Health Advice Card */}
                  <HealthAdviceCard
                    adviceText={currentData?.health_guidance ?? 'Limit prolonged outdoor activity, especially for sensitive groups.'}
                    source={currentData?.health_guidance_source ?? 'US EPA Air Quality Guidelines'}
                    onClick={() => setIsHealthModalOpen(true)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(9, 12, 19, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '10px 0 env(safe-area-inset-bottom, 8px)',
            zIndex: 60,
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
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    color: isActive ? '#ff7a00' : 'var(--text-secondary)',
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    padding: '6px 0',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </main>

      {/* Health Guidance & Actionable Precautions Modal */}
      <HealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        currentData={currentData}
        locationName={currentLocation.name}
      />
    </div>
  );
};

export default App;
