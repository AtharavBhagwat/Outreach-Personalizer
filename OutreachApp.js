'use client'
import { useState, useEffect } from 'react'

// ── Confidence helpers ───────────────────────────────────────────────────────
function confColor(pct) {
  if (pct >= 75) return { ring: '#22c55e', bg: '#052e16', text: '#4ade80', label: 'HIGH MATCH' }
  if (pct >= 50) return { ring: '#f59e0b', bg: '#2d1d05', text: '#fbbf24', label: 'LIKELY MATCH' }
  return { ring: '#ef4444', bg: '#2d0505', text: '#f87171', label: 'LOW SIGNAL' }
}

function ConfidenceRing({ pct }) {
  const size = 72
  const r = 30
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  const { ring, text } = confColor(pct)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={36} cy={36} r={r} fill="none" stroke="#1e293b" strokeWidth={7} />
      <circle
        cx={36} cy={36} r={r} fill="none" stroke={ring} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray 1.2s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={13} fontWeight="800" fill={text} fontFamily="'Courier New', monospace">
        {pct}%
      </text>
    </svg>
  )
}

// ── Person Card ──────────────────────────────────────────────────────────────
function PersonCard({ person, role, message, delay }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { ring, bg, text, label } = confColor(person.confidence || 0)

  const roleMap = {
    hiring_manager: { emoji: '🎯', label: 'Hiring Manager', color: '#1e3a5f', accent: '#3b82f6' },
    recruiter:      { emoji: '📋', label: 'Recruiter',       color: '#2d1b69', accent: '#8b5cf6' },
    team_member:    { emoji: '🤝', label: 'Team Member',     color: '#052e16', accent: '#22c55e' },
  }
  const rc = roleMap[role]
  const initials = (person.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const copy = () => {
    navigator.clipboard.writeText(`Subject: ${message?.subject}\n\n${message?.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1f2937',
      borderRadius: 14,
      overflow: 'hidden',
      animation: `fadeUp 0.5s ease ${delay}s both`,
    }}>
      {/* Role header */}
      <div style={{
        background: rc.color,
        padding: '11px 22px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `2px solid ${rc.accent}33`,
      }}>
        <span style={{ fontSize: 17 }}>{rc.emoji}</span>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: '0.18em', color: '#e2e8f0' }}>
          {rc.label.toUpperCase()}
        </span>
      </div>

      {/* Profile row */}
      <div style={{ padding: '20px 22px 0', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 50, height: 50, borderRadius: '50%',
          background: `linear-gradient(135deg, ${rc.color}, ${rc.accent})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0,
          border: `2px solid ${rc.accent}55`,
        }}>{initials}</div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>
            {person.name || 'Not found'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4, marginBottom: 8 }}>
            {person.title || ''}
          </div>
          {person.linkedin_url && (
            <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              color: '#60a5fa', fontSize: 11, fontFamily: "'Courier New', monospace",
              textDecoration: 'none', letterSpacing: '0.04em',
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="#60a5fa">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              {(person.linkedin_url || '').replace('https://www.', '').replace('https://', '')}
            </a>
          )}
        </div>

        {/* Ring + label */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <ConfidenceRing pct={person.confidence || 0} />
          <div style={{
            marginTop: 5, fontSize: 9, fontWeight: 700,
            fontFamily: "'Courier New', monospace",
            color: text, letterSpacing: '0.08em',
          }}>{label}</div>
        </div>
      </div>

      {/* Signal badge */}
      <div style={{ padding: '14px 22px 18px' }}>
        <div style={{
          padding: '9px 14px',
          background: bg,
          border: `1px solid ${ring}33`,
          borderRadius: 8,
          display: 'flex', alignItems: 'flex-start', gap: 9,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: ring, flexShrink: 0, marginTop: 4,
          }} />
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: text, lineHeight: 1.6 }}>
            {person.signal || 'Signal data unavailable'}
          </span>
        </div>
      </div>

      {/* Message accordion */}
      {message && (
        <div style={{ borderTop: '1px solid #1f2937' }}>
          <button onClick={() => setOpen(!open)} style={{
            width: '100%', padding: '13px 22px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: '#64748b', fontFamily: "'Courier New', monospace",
            fontSize: 11, letterSpacing: '0.12em',
          }}>
            <span>✉ VIEW OUTREACH MESSAGE</span>
            <span style={{ transition: '0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>

          {open && (
            <div style={{ padding: '0 22px 22px', animation: 'fadeUp 0.25s ease' }}>
              <div style={{
                background: '#0f172a', borderRadius: 8, padding: '10px 16px',
                marginBottom: 14, display: 'flex', gap: 12, alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: '#475569', flexShrink: 0 }}>SUBJECT:</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{message.subject}</span>
              </div>
              <div style={{
                fontSize: 14, lineHeight: 1.85, color: '#cbd5e1',
                whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif',
              }}>{message.body}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <button onClick={copy} style={{
                  padding: '9px 20px',
                  background: copied ? '#15803d' : rc.accent,
                  color: '#fff', border: 'none', borderRadius: 7,
                  fontFamily: "'Courier New', monospace", fontSize: 11,
                  letterSpacing: '0.1em', cursor: 'pointer',
                }}>
                  {copied ? '✓ COPIED' : 'COPY MESSAGE'}
                </button>
                {person.linkedin_url && (
                  <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
                    padding: '9px 20px',
                    border: '1px solid #3b82f6', borderRadius: 7,
                    color: '#60a5fa', fontFamily: "'Courier New', monospace",
                    fontSize: 11, letterSpacing: '0.1em', textDecoration: 'none',
                  }}>OPEN PROFILE ↗</a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function OutreachApp() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const phases = [
    '🔎 Fetching job details from LinkedIn...',
    '🕵️ Hunting for hiring manager, recruiter & team member...',
    '✍️ Writing personalized outreach messages...',
  ]

  useEffect(() => {
    if (!loading) return
    let i = 0
    setPhase(0)
    const t = setInterval(() => {
      i++
      if (i < phases.length) setPhase(i)
      else clearInterval(t)
    }, 8000)
    return () => clearInterval(t)
  }, [loading])

  const analyze = async () => {
    if (!url.trim()) { setError('Paste a LinkedIn job URL to get started.'); return }
    if (!url.includes('linkedin.com')) { setError('Must be a LinkedIn URL.'); return }
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const { job, people, messages } = result || {}

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 100%)',
        borderBottom: '1px solid #1e293b',
        padding: '40px 48px 36px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0f172a', borderRadius: 20, padding: '5px 14px',
            border: '1px solid #1e293b', marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'blink 2s infinite' }} />
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: '0.2em', color: '#64748b' }}>
              POWERED BY CLAUDE + WEB SEARCH
            </span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Find your people.<br />
            <span style={{
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Write the right message.
            </span>
          </h1>
          <p style={{ color: '#475569', fontSize: 14, fontFamily: "'Courier New', monospace", letterSpacing: '0.04em' }}>
            Paste any LinkedIn job → get hiring manager, recruiter & team member with confidence scores + tailored outreach
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 48px 80px' }}>

        {/* Input */}
        <div style={{
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 14, padding: '26px 28px', marginBottom: 36,
        }}>
          <label style={{
            display: 'block', fontFamily: "'Courier New', monospace",
            fontSize: 10, letterSpacing: '0.25em', color: '#475569',
            marginBottom: 12, textTransform: 'uppercase',
          }}>LinkedIn Job URL</label>

          <div style={{ display: 'flex', gap: 12 }}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && analyze()}
              placeholder="https://www.linkedin.com/jobs/view/..."
              style={{
                flex: 1, padding: '13px 16px',
                background: '#020617', border: '1px solid #1e293b',
                borderRadius: 9, color: '#e2e8f0', fontSize: 14,
                fontFamily: "'Courier New', monospace", outline: 'none',
              }}
            />
            <button
              onClick={analyze}
              disabled={loading}
              style={{
                padding: '13px 30px',
                background: loading
                  ? '#1e293b'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: loading ? '#475569' : '#fff',
                border: 'none', borderRadius: 9,
                fontFamily: "'Courier New', monospace",
                fontSize: 12, letterSpacing: '0.12em',
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', fontWeight: 700,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'ANALYZING...' : 'ANALYZE →'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontFamily: "'Courier New', monospace", fontSize: 12, marginTop: 12 }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '56px 0', animation: 'fadeUp 0.4s ease' }}>
            <div style={{
              width: 36, height: 36,
              border: '3px solid #1e293b', borderTopColor: '#3b82f6',
              borderRadius: '50%', margin: '0 auto 24px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{
              fontFamily: "'Courier New', monospace", fontSize: 13,
              color: '#64748b', letterSpacing: '0.08em',
            }}>{phases[phase]}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
              {phases.map((_, i) => (
                <div key={i} style={{
                  width: i === phase ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === phase ? '#3b82f6' : '#1e293b',
                  transition: 'all 0.4s ease',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Job summary */}
        {job && !loading && (
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 12, padding: '22px 26px', marginBottom: 28,
            animation: 'fadeUp 0.4s ease',
          }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: '0.25em', color: '#334155', marginBottom: 12 }}>
              JOB INTEL
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{job.role_title}</span>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: '#60a5fa' }}>@ {job.company_name}</span>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#334155' }}>{job.location}</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, marginBottom: 14 }}>{job.short_description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(job.key_skills || []).map(s => (
                <span key={s} style={{
                  padding: '3px 12px', background: '#020617',
                  border: '1px solid #1e293b', borderRadius: 20,
                  fontFamily: "'Courier New', monospace", fontSize: 10,
                  color: '#64748b', letterSpacing: '0.05em',
                }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Cards */}
        {people && messages && !loading && (
          <div>
            <div style={{
              fontFamily: "'Courier New', monospace", fontSize: 10,
              letterSpacing: '0.2em', color: '#334155', marginBottom: 22,
              animation: 'fadeUp 0.4s ease',
            }}>
              ✓ 3 CONTACTS IDENTIFIED — EXPAND TO VIEW MESSAGE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {['hiring_manager', 'recruiter', 'team_member'].map((role, i) => (
                <PersonCard
                  key={role}
                  person={people[role] || {}}
                  role={role}
                  message={messages[role]}
                  delay={i * 0.12}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 60, paddingTop: 24,
          borderTop: '1px solid #0f172a',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: "'Courier New', monospace", fontSize: 10,
          letterSpacing: '0.1em', color: '#1e293b',
        }}>
          <span>OUTREACH PERSONALIZER</span>
          <span>CLAUDE · WEB SEARCH · VERCEL</span>
        </div>
      </div>
    </div>
  )
}
