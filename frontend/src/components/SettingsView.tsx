import React, { useState } from 'react';
import { Shield, Database, Award, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';

interface SettingsViewProps {
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  onRefreshData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tempUnit,
  setTempUnit,
  onRefreshData,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoRefreshMin, setAutoRefreshMin] = useState<number>(() => {
    return Number(localStorage.getItem('airscope_refresh_interval')) || 0;
  });

  const handleUnitChange = (unit: 'C' | 'F') => {
    setTempUnit(unit);
    localStorage.setItem('airscope_temp_unit', unit);
    triggerSaved();
  };

  const handleAutoRefreshChange = (mins: number) => {
    setAutoRefreshMin(mins);
    localStorage.setItem('airscope_refresh_interval', mins.toString());
    triggerSaved();
  };

  const triggerSaved = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetSettings = () => {
    localStorage.removeItem('airscope_temp_unit');
    localStorage.removeItem('airscope_refresh_interval');
    setTempUnit('C');
    setAutoRefreshMin(0);
    if (onRefreshData) onRefreshData();
    triggerSaved();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 28px 28px', maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
          Settings & Provenance
        </h2>
        {saveSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Interactive Preferences Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={18} color="#ff7a00" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Display Preferences
          </h3>
        </div>

        {/* Temperature Unit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Temperature Unit</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Choose whether ambient temperatures are displayed in Celsius or Fahrenheit
            </p>
          </div>
          <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '3px' }}>
            <button
              onClick={() => handleUnitChange('C')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: tempUnit === 'C' ? 'var(--accent-orange)' : 'transparent',
                color: tempUnit === 'C' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              °C (Celsius)
            </button>
            <button
              onClick={() => handleUnitChange('F')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: tempUnit === 'F' ? 'var(--accent-orange)' : 'transparent',
                color: tempUnit === 'F' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              °F (Fahrenheit)
            </button>
          </div>
        </div>

        {/* Auto Refresh Setting */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Auto-Refresh Rate</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Automatically poll for updated observations from Open-Meteo
            </p>
          </div>
          <select
            value={autoRefreshMin}
            onChange={(e) => handleAutoRefreshChange(Number(e.target.value))}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '12px',
            }}
          >
            <option value={0}>Manual refresh only</option>
            <option value={5}>Every 5 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleResetSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset to defaults</span>
          </button>
        </div>
      </div>

      {/* Environmental Data Provider */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={18} color="#ff7a00" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Environmental Data Provider
          </h3>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            AirScope ingests air quality observations, atmospheric chemical concentrations, and 7-day numerical forecasts from the <strong>Open-Meteo Air Quality & Weather API</strong>.
          </p>
          <p style={{ marginTop: '8px' }}>
            Atmospheric calculations are produced by the Copernicus Atmosphere Monitoring Service (CAMS) and NOAA Global Forecast System Aerosol (GFS-Aerosols) models at ~11 km resolution.
          </p>
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: '#f8fafc',
          }}>
            Attribution: <em>"Weather data by Open-Meteo.com under Creative Commons Attribution 4.0 International (CC BY 4.0)"</em>
          </div>
        </div>
      </div>

      {/* AQI Standard Breakpoints */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={18} color="#ff7a00" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Air Quality Standard: US EPA AQI (0–500)
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          AirScope strictly uses and displays the standard <strong>US EPA AQI</strong> scale (40 CFR Part 58, Appendix G). Concentrations are truncated according to official EPA rules:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { range: '0 – 50', label: 'Good', color: '#22c55e', desc: 'Little to no health risk.' },
            { range: '51 – 100', label: 'Moderate', color: '#eab308', desc: 'Acceptable; unusually sensitive individuals should consider reducing prolonged outdoor exertion.' },
            { range: '101 – 150', label: 'Poor (Sensitive Groups)', color: '#ff7a00', desc: 'Members of sensitive groups may experience health effects. Limit prolonged outdoor exertion.' },
            { range: '151 – 200', label: 'Unhealthy', color: '#ef4444', desc: 'General public may experience health effects; avoid prolonged outdoor activity.' },
            { range: '201 – 300', label: 'Very Unhealthy', color: '#a855f7', desc: 'Health alert: risk of health effects is increased for everyone.' },
            { range: '301 – 500', label: 'Severe / Hazardous', color: '#991b1b', desc: 'Health warning of emergency conditions: everyone is affected.' },
          ].map((b) => (
            <div key={b.range} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: b.color }}>{b.label}</span>
                <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>{b.range}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Architecture */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={18} color="#22c55e" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Privacy by Design
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          AirScope requires no user login, no account creation, no cookies, and no tracking scripts. Preferences are saved purely to your browser's local storage.
        </p>
      </div>
    </div>
  );
};
