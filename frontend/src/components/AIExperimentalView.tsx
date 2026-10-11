import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ArrowLeft, BarChart3, Calculator, Table } from 'lucide-react';
import { fetchMLEvaluation } from '../api';
import type { MLEvaluationResponse } from '../types';

interface AIExperimentalViewProps {
  onBack?: () => void;
  isMobile?: boolean;
}

export const AIExperimentalView: React.FC<AIExperimentalViewProps> = ({ onBack, isMobile: propIsMobile }) => {
  const isMobile = propIsMobile !== undefined ? propIsMobile : (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [data, setData] = useState<MLEvaluationResponse | null>(null);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Interactive formula inspector inputs
  const [inputToday, setInputToday] = useState<number>(140);
  const [inputLag1, setInputLag1] = useState<number>(135);
  const [inputLag2, setInputLag2] = useState<number>(150);
  const [inputLag3, setInputLag3] = useState<number>(145);
  const [inputLag7, setInputLag7] = useState<number>(160);
  const [inputMonth, setInputMonth] = useState<number>(10);
  const [inputDOW, setInputDOW] = useState<number>(0);

  useEffect(() => {
    fetchMLEvaluation()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load ML evaluation:', err));
  }, []);

  // Compute prediction dynamically from exact model coefficients
  const calculatedPred = Math.round(
    16.0149 +
    0.8760 * inputToday -
    0.1879 * inputLag1 +
    0.1237 * inputLag2 +
    0.0431 * inputLag3 +
    0.0756 * inputLag7 +
    0.7858 * inputMonth -
    0.5916 * inputDOW
  );

  // 1. Critical Integrity Disclaimer Banner (Red Warning)
  const renderWarningBanner = () => (
    <div style={{
      padding: '16px 20px',
      borderRadius: '16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
    }}>
      <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', marginBottom: '3px' }}>
          Data Policy Statement: Underperformed Persistence Baseline (MAE 32.11 vs 31.46)
        </h4>
        <p style={{ fontSize: '12px', color: '#f8fafc', lineHeight: 1.5 }}>
          This model was trained on historical Delhi daily air-quality records ending on <strong>July 1, 2020</strong>.
          On its chronological test partition (394 test days from June 2019 to June 2020), the Linear Regression model achieved a <strong>Test MAE of 32.11</strong>, which did not outperform the naive persistence baseline (<strong>MAE 31.46</strong>).
          Per our environmental integrity charter, this model is <strong>not validated for live forecasting</strong> and is never connected to live atmospheric forecast charts.
        </p>
      </div>
    </div>
  );

  // 2. Chronological Test Evaluation Card
  const renderChronologicalCard = () => (
    <div className="glass-card" style={{ padding: isMobile ? '18px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart3 size={18} color="#ff7a00" />
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          Chronological Test Evaluation (80/20 Split)
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Model Test MAE</span>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {data?.metrics.mae ?? 32.11}
          </p>
          <span style={{ fontSize: '10px', color: '#ef4444', display: 'block', marginTop: '2px' }}>
            +0.65 higher error than persistence
          </span>
        </div>

        <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Persistence Baseline MAE</span>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>
            {data?.metrics.persistence_mae ?? 31.46}
          </p>
          <span style={{ fontSize: '10px', color: '#22c55e', display: 'block', marginTop: '2px' }}>
            Baseline benchmark (predict t as t-1)
          </span>
        </div>

        <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Model Test RMSE</span>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {data?.metrics.rmse ?? 43.64}
          </p>
        </div>

        <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Persistence RMSE</span>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {data?.metrics.persistence_rmse ?? 45.11}
          </p>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
        <p><strong>Evaluation Window:</strong> 394 daily test observations (2019-06-03 to 2020-06-30).</p>
        <p style={{ marginTop: '2px' }}><strong>Training Window:</strong> 1,572 daily records (2015-01-08 to 2019-06-02).</p>
      </div>
    </div>
  );

  // 3. Artifact Benchmark Comparison Card
  const renderArtifactCard = () => (
    <div className="glass-card" style={{ padding: isMobile ? '18px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Table size={18} color="#ff7a00" />
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          Artifact Benchmark Comparison (model_comparison.csv)
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 10px' }}>Model Architecture</th>
              <th style={{ padding: '8px 10px' }}>Test MAE</th>
              <th style={{ padding: '8px 10px' }}>Test RMSE</th>
              <th style={{ padding: '8px 10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
              <td style={{ padding: '10px', fontWeight: 600, color: '#ffffff' }}>Persistence Baseline</td>
              <td style={{ padding: '10px', fontWeight: 700, color: '#22c55e' }}>31.46</td>
              <td style={{ padding: '10px', color: '#ffffff' }}>45.11</td>
              <td style={{ padding: '10px', color: '#22c55e' }}>Best MAE</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <td style={{ padding: '10px', color: '#ffffff' }}>Random Forest</td>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>32.04</td>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>44.08</td>
              <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Historical</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 122, 0, 0.08)' }}>
              <td style={{ padding: '10px', fontWeight: 600, color: '#ffffff' }}>Linear Regression (Exported)</td>
              <td style={{ padding: '10px', fontWeight: 700, color: '#ff7a00' }}>32.11</td>
              <td style={{ padding: '10px', color: '#ffffff' }}>43.64</td>
              <td style={{ padding: '10px', color: '#ff7a00' }}>Inspected</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', color: '#ffffff' }}>HistGradientBoosting</td>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>32.14</td>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>44.94</td>
              <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Historical</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{
        padding: '12px 14px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: 'auto',
      }}>
        <ShieldAlert size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
          All models in the experiment exhibited similar error profiles around MAE ~32, confirming that complex features did not provide a decisive operational edge over naive persistence on this dataset.
        </p>
      </div>
    </div>
  );

  // 4. Interactive Linear Formula Inspection Card
  const renderFormulaCard = () => (
    <div className="glass-card" style={{ padding: isMobile ? '18px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calculator size={18} color="#ff7a00" />
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          Interactive Linear Formula Inspection
        </h3>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Inspect how the exact fitted model weights calculate next-day AQI for any set of inputs:
      </p>

      {/* Input sliders/fields */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            aqi_today (β = +0.876)
          </label>
          <input
            type="number"
            value={inputToday}
            onChange={(e) => setInputToday(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            aqi_lag1 (β = -0.188)
          </label>
          <input
            type="number"
            value={inputLag1}
            onChange={(e) => setInputLag1(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            aqi_lag2 (β = +0.124)
          </label>
          <input
            type="number"
            value={inputLag2}
            onChange={(e) => setInputLag2(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            aqi_lag3 (β = +0.043)
          </label>
          <input
            type="number"
            value={inputLag3}
            onChange={(e) => setInputLag3(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            aqi_lag7 (β = +0.076)
          </label>
          <input
            type="number"
            value={inputLag7}
            onChange={(e) => setInputLag7(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            month (β = +0.786)
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={inputMonth}
            onChange={(e) => setInputMonth(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            day_of_week (β = -0.592)
          </label>
          <input
            type="number"
            min={0}
            max={6}
            value={inputDOW}
            onChange={(e) => setInputDOW(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            intercept (β₀)
          </label>
          <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', color: '#38bdf8', fontSize: '13px', fontWeight: 600 }}>
            +16.0149 (fixed)
          </div>
        </div>
      </div>

      {/* Calculated Result Banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '14px',
        backgroundColor: 'rgba(255, 122, 0, 0.08)',
        border: '1px solid rgba(255, 122, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff7a00', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Calculated Next-Day AQI (Formula Result):
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '34px', fontWeight: 800, color: '#ffffff' }}>
                {calculatedPred}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                (vs Persistence: {inputToday})
              </span>
            </div>
          </div>

          {/* Bottom-right interactive How? button */}
          <button
            onClick={() => setShowFormula((prev) => !prev)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: showFormula ? 'rgba(255, 122, 0, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 122, 0, 0.45)',
              color: '#ff7a00',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 122, 0, 0.2)';
              e.currentTarget.style.borderColor = '#ff7a00';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = showFormula ? 'rgba(255, 122, 0, 0.25)' : 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.45)';
            }}
          >
            <span>How?</span>
            <Calculator size={13} color="#ff7a00" />
          </button>
        </div>

        {/* Expandable Mathematical Formula */}
        {showFormula && (
          <div style={{
            marginTop: '4px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 122, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff7a00', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Mathematical Regression Formula:
            </span>
            <div style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#f8fafc',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              lineHeight: 1.6,
              overflowX: 'auto',
            }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                AQI(t+1) = 16.0149 + 0.8760·AQI(t) − 0.1879·AQI(t-1) + 0.1237·AQI(t-2) + 0.0431·AQI(t-3) + 0.0756·AQI(t-7) + 0.7858·Month − 0.5916·DayOfWeek
              </div>
              <div style={{ color: '#ffffff' }}>
                = 16.0149 + (0.8760 × {inputToday}) − (0.1879 × {inputLag1}) + (0.1237 × {inputLag2}) + (0.0431 × {inputLag3}) + (0.0756 × {inputLag7}) + (0.7858 × {inputMonth}) − (0.5916 × {inputDOW})
              </div>
              <div style={{ color: '#22c55e', fontWeight: 700, marginTop: '4px' }}>
                = 16.01 + {(0.8760 * inputToday).toFixed(2)} − {(0.1879 * inputLag1).toFixed(2)} + {(0.1237 * inputLag2).toFixed(2)} + {(0.0431 * inputLag3).toFixed(2)} + {(0.0756 * inputLag7).toFixed(2)} + {(0.7858 * inputMonth).toFixed(2)} − {(0.5916 * inputDOW).toFixed(2)} = {calculatedPred}
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Coefficients derived from Scikit-Learn LinearRegression trained on Delhi daily air quality records (2015–2020).
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // 5. Genuine Test Partition Samples Card
  const renderDatasetCard = () => {
    if (!data?.test_sample_records || data.test_sample_records.length === 0) return null;
    return (
      <div className="glass-card" style={{ padding: isMobile ? '18px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          Genuine Test Partition Samples (delhi_model_data.csv)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          These rows show authentic historical records from the final 20% test partition, comparing model predictions against recorded targets and baseline predictions:
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px' }}>Test Date</th>
                <th style={{ padding: '8px' }}>Actual Target</th>
                <th style={{ padding: '8px' }}>Model Predicted</th>
                <th style={{ padding: '8px' }}>Model Error</th>
                <th style={{ padding: '8px' }}>Persistence Pred</th>
                <th style={{ padding: '8px' }}>Persistence Error</th>
              </tr>
            </thead>
            <tbody>
              {data.test_sample_records.map((r) => (
                <tr key={r.date} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '8px', color: '#ffffff', fontWeight: 600 }}>{r.date}</td>
                  <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 700 }}>{r.actual}</td>
                  <td style={{ padding: '8px', color: '#ffffff' }}>{r.model_pred}</td>
                  <td style={{ padding: '8px', color: r.model_abs_error <= r.persistence_abs_error ? '#22c55e' : '#ef4444' }}>
                    {r.model_abs_error}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{r.persistence_pred}</td>
                  <td style={{ padding: '8px', color: r.persistence_abs_error <= r.model_abs_error ? '#22c55e' : '#ef4444' }}>
                    {r.persistence_abs_error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: isMobile ? '0 16px 28px' : '0 28px 28px',
      maxWidth: '1080px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: '#ffffff' }}>
              ML Model Benchmark & Integrity Audit
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Transparent verification of historical AI experiment artifacts & offline linear regression model
            </p>
          </div>
        </div>

        <span style={{
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}>
          Not For Operational Forecasting
        </span>
      </div>

      {/* Main Content Layout */}
      {!isMobile ? (
        /* DESKTOP LAYOUT (100% UNCHANGED) */
        <>
          {renderWarningBanner()}
          {/* Upper Grid: Historical Benchmark Metrics + Model Comparison Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {renderChronologicalCard()}
            {renderArtifactCard()}
          </div>
          {renderFormulaCard()}
          {renderDatasetCard()}
        </>
      ) : (
        /* MOBILE LAYOUT:
           1st: Red warning
           2nd: Interactive linear formula inspection card
           3rd: Chronological test evaluation card
           4th: Artifact benchmark comparison card
           5th: Genuine test partition samples card
        */
        <>
          {renderWarningBanner()}
          {renderFormulaCard()}
          {renderChronologicalCard()}
          {renderArtifactCard()}
          {renderDatasetCard()}
        </>
      )}
    </div>
  );
};
