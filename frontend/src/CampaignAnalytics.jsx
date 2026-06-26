import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import { apiClient } from './lib/apiClient';
import './Landing.css';

const RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const EMPTY_DASHBOARD = {
  funnel: { registered: 0, credited: 0, claimed: 0 },
  conversion: [],
  retention: [],
  as_of_ledger: null,
};

function BarChart({ data, valueKey, labelKey, color = 'var(--accent)' }) {
  const max = Math.max(...data.map((d) => d[valueKey] ?? 0), 1);
  return (
    <div role="img" aria-label="Bar chart" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((row, i) => {
        const val = row[valueKey] ?? 0;
        const pct = (val / max) * 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 80,
                flexShrink: 0,
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row[labelKey]}
            </span>
            <div
              style={{
                flex: 1,
                height: 22,
                background: 'var(--bg-elevated)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: color,
                  borderRadius: 6,
                  transition: 'width 0.5s ease',
                  minWidth: val > 0 ? 4 : 0,
                }}
              />
            </div>
            <span style={{ width: 48, flexShrink: 0, fontSize: '0.8rem', color: 'var(--text)', textAlign: 'right' }}>
              {typeof val === 'number' && val < 1 && val > 0
                ? `${(val * 100).toFixed(1)}%`
                : val.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FunnelStep({ label, value, pct, color }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flex: 1,
      }}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          borderRadius: 10,
          overflow: 'hidden',
          height: 120,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${Math.max(pct, 2)}%`,
            background: color,
            borderRadius: '10px 10px 0 0',
            transition: 'height 0.5s ease',
          }}
        />
      </div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
        {value.toLocaleString()}
      </p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '0.75rem', color }}>{pct.toFixed(1)}%</p>
    </div>
  );
}

function Card({ title, children, hint }) {
  return (
    <div
      style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 22px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
        {hint && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function CampaignAnalytics({
  theme,
  onToggleTheme,
  stellarNetwork,
  onChangeStellarNetwork,
  walletAddress,
  walletBalance,
  isWalletLoading,
  isWalletBalanceLoading,
  onConnectWallet,
  onDisconnectWallet,
}) {
  const [range, setRange] = useState('30d');
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.getAnalyticsDashboard({ range });
      setDashboard({ ...EMPTY_DASHBOARD, ...data });
    } catch {
      setError('Could not load analytics. The dashboard endpoint may not be available yet.');
      setDashboard(EMPTY_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const { funnel, conversion, retention, as_of_ledger } = dashboard;
  const registeredVal = funnel.registered ?? 0;
  const creditedVal = funnel.credited ?? 0;
  const claimedVal = funnel.claimed ?? 0;
  const funnelMax = Math.max(registeredVal, 1);

  return (
    <div className="landing">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        stellarNetwork={stellarNetwork}
        onChangeStellarNetwork={onChangeStellarNetwork}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isWalletLoading={isWalletLoading}
        isWalletBalanceLoading={isWalletBalanceLoading}
        onConnectWallet={onConnectWallet}
        onDisconnectWallet={onDisconnectWallet}
      />
      <main id="main-content" className="landing-main" tabIndex="-1">
        <section className="section" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div>
              <h1
                className="section-title"
                style={{ margin: '0 0 4px' }}
              >
                Operator Analytics
              </h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Funnel, retention, and conversion metrics sourced from indexed rollups.
                {as_of_ledger && (
                  <span style={{ marginLeft: 8 }}>
                    As of ledger <strong>{as_of_ledger}</strong>.
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRange(r.value)}
                  className={range === r.value ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ fontSize: '0.8rem', padding: '5px 14px' }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="detail-error" role="alert" style={{ marginBottom: 20 }}>
              <p>{error}</p>
              <button type="button" className="btn btn-primary" onClick={loadDashboard}>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <p role="status" style={{ color: 'var(--text-muted)' }}>Loading analytics…</p>
          ) : (
            <>
              {/* Funnel */}
              <Card
                title="Registration → Credit → Claim Funnel"
                hint={`${RANGES.find((r) => r.value === range)?.label}`}
              >
                {registeredVal === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No data yet for this period.
                  </p>
                ) : (
                  <div
                    style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}
                    role="img"
                    aria-label={`Funnel: ${registeredVal} registered, ${creditedVal} credited, ${claimedVal} claimed`}
                  >
                    <FunnelStep
                      label="Registered"
                      value={registeredVal}
                      pct={(registeredVal / funnelMax) * 100}
                      color="var(--accent)"
                    />
                    <div style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
                    <FunnelStep
                      label="Credited"
                      value={creditedVal}
                      pct={(creditedVal / funnelMax) * 100}
                      color="var(--success)"
                    />
                    <div style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
                    <FunnelStep
                      label="Claimed"
                      value={claimedVal}
                      pct={(claimedVal / funnelMax) * 100}
                      color="#a78bfa"
                    />
                  </div>
                )}

                {registeredVal > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 24,
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.83rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Credit rate: </span>
                      <strong>
                        {registeredVal > 0
                          ? ((creditedVal / registeredVal) * 100).toFixed(1)
                          : 0}
                        %
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Claim rate: </span>
                      <strong>
                        {creditedVal > 0
                          ? ((claimedVal / creditedVal) * 100).toFixed(1)
                          : 0}
                        %
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Overall conversion: </span>
                      <strong>
                        {registeredVal > 0
                          ? ((claimedVal / registeredVal) * 100).toFixed(1)
                          : 0}
                        %
                      </strong>
                    </div>
                  </div>
                )}
              </Card>

              {/* Conversion over time */}
              <Card title="Conversion Rate Over Time">
                {conversion.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No conversion data available for this period.
                  </p>
                ) : (
                  <BarChart
                    data={conversion}
                    labelKey="date"
                    valueKey="rate"
                    color="var(--success)"
                  />
                )}
              </Card>

              {/* Retention cohorts */}
              <Card title="Retention Cohorts">
                {retention.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No retention cohort data available for this period.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}
                      aria-label="Retention cohort table"
                    >
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            style={{
                              textAlign: 'left',
                              padding: '8px 12px',
                              color: 'var(--text-muted)',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            Cohort
                          </th>
                          <th
                            scope="col"
                            style={{
                              textAlign: 'right',
                              padding: '8px 12px',
                              color: 'var(--text-muted)',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            Size
                          </th>
                          {retention[0]?.weeks?.map((_, i) => (
                            <th
                              key={i}
                              scope="col"
                              style={{
                                textAlign: 'right',
                                padding: '8px 12px',
                                color: 'var(--text-muted)',
                                borderBottom: '1px solid var(--border)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              W{i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {retention.map((cohort, idx) => (
                          <tr
                            key={idx}
                            style={{
                              background: idx % 2 === 0 ? 'transparent' : 'var(--bg-elevated)',
                            }}
                          >
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                              {cohort.cohort}
                            </td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', color: 'var(--text)' }}>
                              {cohort.size?.toLocaleString() ?? '—'}
                            </td>
                            {cohort.weeks?.map((w, i) => {
                              const pct = typeof w === 'number' ? w * 100 : null;
                              return (
                                <td
                                  key={i}
                                  style={{
                                    padding: '8px 12px',
                                    borderBottom: '1px solid var(--border)',
                                    textAlign: 'right',
                                    color: pct !== null ? 'var(--text)' : 'var(--text-muted)',
                                    background:
                                      pct !== null
                                        ? `rgba(76,141,255,${(pct / 100) * 0.3})`
                                        : undefined,
                                  }}
                                >
                                  {pct !== null ? `${pct.toFixed(0)}%` : '—'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
