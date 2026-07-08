import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_BASE = 'https://idbc-lead-gen.onrender.com/api/leads';
const loanTypes = ['All', 'Personal Loan', 'Home Loan', 'Auto Loan', 'Mortgage Loan'];

export default function App() {
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loanType, setLoanType] = useState('All');
  const [minScore, setMinScore] = useState(60);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = { minScore };
      if (loanType !== 'All') params.loanType = loanType;
      const res = await axios.get(API_BASE, { params });
      setLeads(res.data.leads);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchLeads(); }, [loanType, minScore]);

  const sortedLeads = useMemo(() => {
    const copy = [...leads];
    copy.sort((a, b) => sortDesc ? b.leadScore - a.leadScore : a.leadScore - b.leadScore);
    return copy;
  }, [leads, sortDesc]);

  const distribution = useMemo(() => {
    const buckets = [
      { label: '0-40', min: 0, max: 40, count: 0 },
      { label: '41-60', min: 41, max: 60, count: 0 },
      { label: '61-75', min: 61, max: 75, count: 0 },
      { label: '76-90', min: 76, max: 90, count: 0 },
      { label: '91-100', min: 91, max: 100, count: 0 },
    ];
    leads.forEach(l => {
      const b = buckets.find(x => l.leadScore >= x.min && l.leadScore <= x.max);
      if (b) b.count++;
    });
    const max = Math.max(...buckets.map(b => b.count), 1);
    return buckets.map(b => ({ ...b, pct: (b.count / max) * 100 }));
  }, [leads]);

  return (
    <div style={S.app}>
      <style>{globalCss}</style>

      <div style={S.shell}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <div style={S.brandRow}>
            <div style={S.brandMark}>ID</div>
            <div>
              <div style={S.brandName}>Smart Lead Engine</div>
              <div style={S.brandSub}>IDBI Innovate · Track 02</div>
            </div>
          </div>

          <div style={S.navSection}>
            <div style={S.navLabel}>Filter by loan type</div>
            {loanTypes.map(t => (
              <button
                key={t}
                onClick={() => setLoanType(t)}
                style={{ ...S.navItem, ...(loanType === t ? S.navItemActive : {}) }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={S.navSection}>
            <div style={S.navLabel}>Minimum lead score</div>
            <div style={S.sliderRow}>
              <input
                type="range" min="0" max="100" value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                style={S.slider}
              />
              <span style={S.sliderValue}>{minScore}</span>
            </div>
          </div>

          <div style={S.navSection}>
            <div style={S.navLabel}>Score distribution</div>
            <div style={S.histogram}>
              {distribution.map(b => (
                <div key={b.label} style={S.histBarWrap}>
                  <div style={{ ...S.histBar, height: `${Math.max(b.pct, 4)}%` }} />
                  <div style={S.histLabel}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={S.main}>
          <div style={S.topBar}>
            <div>
              <h1 style={S.pageTitle}>Retail Lending — Lead Pipeline</h1>
              <p style={S.pageSub}>Behavioral &amp; transactional scoring across synthetic customer data</p>
            </div>
          </div>

          {summary && (
            <div style={S.statsRow}>
              <StatCard label="Total Qualified Leads" value={summary.totalLeads} />
              <StatCard label="Predicted Conversions" value={summary.predictedConversions} />
              <StatCard label="Conversion Rate" value={`${summary.predictedConversionRate}%`} accent />
              <StatCard label="Target Benchmark" value="30%" subtle />
            </div>
          )}

          <div style={S.tablePanel}>
            <div style={S.tableHeaderRow}>
              <span>Leads ({sortedLeads.length})</span>
              <button style={S.sortBtn} onClick={() => setSortDesc(!sortDesc)}>
                Score {sortDesc ? '↓' : '↑'}
              </button>
            </div>

            {loading ? (
              <div style={S.loadingState}>Scoring leads…</div>
            ) : sortedLeads.length === 0 ? (
              <div style={S.loadingState}>No leads match these filters. Try lowering the minimum score.</div>
            ) : (
              <div style={S.tableScroll}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Customer</th>
                      <th style={S.th}>Loan Interest</th>
                      <th style={S.th}>Est. Income</th>
                      <th style={S.th}>Repay</th>
                      <th style={S.th}>Intent</th>
                      <th style={S.th}>Score</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeads.map(lead => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelected(lead)}
                        style={{ ...S.tr, ...(selected?.id === lead.id ? S.trActive : {}) }}
                      >
                        <td style={S.td}>
                          <div style={S.custName}>{lead.name}</div>
                          <div style={S.custId}>{lead.id}</div>
                        </td>
                        <td style={S.td}>{lead.loanTypeInterest}</td>
                        <td style={{ ...S.td, fontFamily: 'var(--mono)' }}>
                          ₹{lead.estimatedIncome.toLocaleString('en-IN')}
                        </td>
                        <td style={S.td}><MiniBar value={lead.repaymentScore} /></td>
                        <td style={S.td}><MiniBar value={lead.intentScore} /></td>
                        <td style={S.td}><ScorePill score={lead.leadScore} /></td>
                        <td style={S.td}>
                          {lead.predictedConversion
                            ? <span style={S.statusYes}>Likely</span>
                            : <span style={S.statusNo}>Unlikely</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Detail drawer */}
        {selected && (
          <aside style={S.drawer}>
            <button style={S.drawerClose} onClick={() => setSelected(null)}>×</button>
            <div style={S.drawerHead}>
              <div style={S.drawerAvatar}>{selected.name.charAt(0)}</div>
              <div>
                <div style={S.drawerName}>{selected.name}</div>
                <div style={S.drawerMeta}>{selected.id} · Age {selected.age}</div>
              </div>
            </div>

            <div style={S.drawerScoreRow}>
              <ScorePill score={selected.leadScore} big />
              <span style={S.drawerScoreLabel}>Lead Score</span>
            </div>

            <Section title="Financial Snapshot">
              <Row label="Estimated Income" value={`₹${selected.estimatedIncome.toLocaleString('en-IN')}/mo`} />
              <Row label="Declared Salary" value={`₹${selected.monthlySalary.toLocaleString('en-IN')}/mo`} />
              <Row label="UPI Monthly Volume" value={`₹${selected.upiMonthlyVolume.toLocaleString('en-IN')}`} />
              <Row label="Avg Monthly Balance" value={`₹${selected.avgMonthlyBalance.toLocaleString('en-IN')}`} />
              <Row label="Existing EMI" value={`₹${selected.existingEMI.toLocaleString('en-IN')}`} />
              <Row label="Existing Loans" value={selected.existingLoans} />
            </Section>

            <Section title="Score Breakdown">
              <ScoreLine label="Repayment Capacity" value={selected.repaymentScore} />
              <ScoreLine label="Loan Intent" value={selected.intentScore} />
              <ScoreLine label="Financial Stability" value={selected.stabilityScore} />
            </Section>

            <Section title="Why this lead">
              <ul style={S.reasonList}>
                {selected.reasons.map((r, i) => <li key={i} style={S.reasonItem}>{r}</li>)}
              </ul>
            </Section>
          </aside>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, subtle }) {
  return (
    <div style={{ ...S.statCard, ...(accent ? S.statCardAccent : {}), ...(subtle ? S.statCardSubtle : {}) }}>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function ScorePill({ score, big }) {
  let tone = S.pillLow;
  if (score >= 80) tone = S.pillHigh;
  else if (score >= 65) tone = S.pillMid;
  return <span style={{ ...S.pill, ...tone, ...(big ? S.pillBig : {}) }}>{score}</span>;
}

function MiniBar({ value }) {
  return (
    <div style={S.miniBarTrack}>
      <div style={{ ...S.miniBarFill, width: `${value}%` }} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={S.section}>
      <div style={S.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={S.row}>
      <span style={S.rowLabel}>{label}</span>
      <span style={S.rowValue}>{value}</span>
    </div>
  );
}

function ScoreLine({ label, value }) {
  return (
    <div style={S.scoreLine}>
      <div style={S.scoreLineTop}>
        <span style={S.rowLabel}>{label}</span>
        <span style={S.rowValue}>{value}</span>
      </div>
      <MiniBar value={value} />
    </div>
  );
}

const globalCss = `
  :root {
    --ink: #0b1220;
    --panel: #111a2c;
    --panel-2: #16223a;
    --border: #223252;
    --text: #e6ecf6;
    --text-dim: #8b9bbd;
    --gold: #d4af6a;
    --green: #4ade80;
    --amber: #facc15;
    --red: #f87171;
    --mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
    --sans: 'Inter', system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`;

const S = {
  app: { fontFamily: 'var(--sans)', background: 'var(--ink)', minHeight: '100vh', color: 'var(--text)' },
  shell: { display: 'flex', minHeight: '100vh' },

  sidebar: { width: 260, background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '24px 20px', flexShrink: 0 },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  brandMark: { width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), #a67c3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1a1200', fontSize: 14 },
  brandName: { fontWeight: 600, fontSize: 14 },
  brandSub: { fontSize: 11, color: 'var(--text-dim)', marginTop: 2 },

  navSection: { marginBottom: 28 },
  navLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-dim)', marginBottom: 10, fontWeight: 600 },
  navItem: { display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 4, background: 'transparent', border: 'none', color: 'var(--text-dim)', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  navItemActive: { background: 'var(--panel-2)', color: 'var(--gold)', fontWeight: 600 },

  sliderRow: { display: 'flex', alignItems: 'center', gap: 10 },
  slider: { flex: 1, accentColor: '#d4af6a' },
  sliderValue: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--gold)', minWidth: 28, textAlign: 'right' },

  histogram: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginTop: 8 },
  histBarWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  histBar: { width: '100%', background: 'linear-gradient(180deg, var(--gold), #7d5c26)', borderRadius: '3px 3px 0 0', minHeight: 3 },
  histLabel: { fontSize: 9, color: 'var(--text-dim)', marginTop: 6, transform: 'rotate(0deg)' },

  main: { flex: 1, padding: '28px 32px', minWidth: 0 },
  topBar: { marginBottom: 24 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.2 },
  pageSub: { margin: '6px 0 0', fontSize: 13, color: 'var(--text-dim)' },

  statsRow: { display: 'flex', gap: 14, marginBottom: 24 },
  statCard: { flex: 1, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' },
  statCardAccent: { background: 'linear-gradient(135deg, #2a2210, #1a1608)', border: '1px solid var(--gold)' },
  statCardSubtle: { opacity: 0.6 },
  statValue: { fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700 },
  statLabel: { fontSize: 11.5, color: 'var(--text-dim)', marginTop: 6 },

  tablePanel: { background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-dim)' },
  sortBtn: { background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  tableScroll: { maxHeight: 560, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { position: 'sticky', top: 0, background: 'var(--panel)', textAlign: 'left', padding: '10px 18px', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border)' },
  tr: { cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  trActive: { background: 'var(--panel-2)' },
  td: { padding: '11px 18px', fontSize: 13.5, verticalAlign: 'middle' },
  custName: { fontWeight: 600 },
  custId: { fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' },

  statusYes: { color: 'var(--green)', fontSize: 12.5, fontWeight: 600 },
  statusNo: { color: 'var(--text-dim)', fontSize: 12.5 },

  pill: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13 },
  pillBig: { fontSize: 26, padding: '6px 16px' },
  pillHigh: { background: 'rgba(74,222,128,0.15)', color: 'var(--green)' },
  pillMid: { background: 'rgba(250,204,21,0.15)', color: 'var(--amber)' },
  pillLow: { background: 'rgba(248,113,113,0.15)', color: 'var(--red)' },

  miniBarTrack: { width: 60, height: 6, background: 'var(--panel-2)', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', background: 'linear-gradient(90deg, var(--gold), #a67c3d)' },

  drawer: { width: 340, background: 'var(--panel)', borderLeft: '1px solid var(--border)', padding: '24px 22px', flexShrink: 0, position: 'relative' },
  drawerClose: { position: 'absolute', top: 18, right: 18, background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' },
  drawerHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  drawerAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'var(--panel-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--gold)' },
  drawerName: { fontWeight: 700, fontSize: 15 },
  drawerMeta: { fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' },
  drawerScoreRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 10 },
  drawerScoreLabel: { fontSize: 12, color: 'var(--text-dim)' },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 10 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  rowLabel: { fontSize: 12.5, color: 'var(--text-dim)' },
  rowValue: { fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--mono)' },

  scoreLine: { marginBottom: 12 },
  scoreLineTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },

  reasonList: { margin: 0, paddingLeft: 18 },
  reasonItem: { fontSize: 12.5, color: 'var(--text)', marginBottom: 6, lineHeight: 1.4 },
};