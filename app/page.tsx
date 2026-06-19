'use client'
import { useState, useEffect, useRef } from 'react'
import { SKILL_META, SKILLS } from '@/lib/xp'
import type { Skill } from '@/lib/xp'

type Character = {
  id: number
  name: string
  class: string
  level: number
  total_xp: number
  avatar: string
  xpProgress: { current: number; needed: number; percent: number; level: number }
  skills: Record<string, number>
  skillLevels: Record<string, number>
}

type Quest = {
  id: number
  title: string
  description: string
  skill: string
  xp_reward: number
  status: string
  due_date: string | null
}

type LogEntry = {
  id: number
  entry: string
  skill: string
  xp_earned: number
  level_up: string | null
  type: string
  created_at: string
}

type DecayWarning = { skill: string; label: string; emoji: string; daysLeft: number }
type Tab = 'dashboard' | 'quests' | 'skills' | 'log'

const BENCHMARKS_LIST: Record<string, Record<string, { name: string; unit: string }>> = {
  strength: {
    bench_press: { name: 'Bench Press', unit: 'kg' },
    squat: { name: 'Squat', unit: 'kg' },
    deadlift: { name: 'Deadlift', unit: 'kg' },
    pullups: { name: 'Pull-ups', unit: 'reps' },
  },
  endurance: {
    run_5k: { name: '5km Run', unit: 'min' },
    run_10k: { name: '10km Run', unit: 'min' },
  },
  discipline: {
    meditation_streak: { name: 'Meditation Streak', unit: 'days' },
    wake_up_streak: { name: 'Early Rise Streak', unit: 'days' },
  },
  knowledge: {
    books_read: { name: 'Books Read (this year)', unit: 'books' },
  },
  finance: {
    savings_rate: { name: 'Monthly Savings Rate', unit: '%' },
  },
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [char, setChar] = useState<Character | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [warnings, setWarnings] = useState<DecayWarning[]>([])
  const [plan, setPlan] = useState<string>('')
  const [planLoading, setPlanLoading] = useState(false)
  const [xpPops, setXpPops] = useState<{ id: number; xp: number; x: number; y: number }[]>([])
  const popCounter = useRef(0)

  const [taskDesc, setTaskDesc] = useState('')
  const [taskSkill, setTaskSkill] = useState<Skill>('discipline')
  const [taskQuest, setTaskQuest] = useState<string>('')
  const [taskLoading, setTaskLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const [showQuestForm, setShowQuestForm] = useState(false)
  const [questTitle, setQuestTitle] = useState('')
  const [questSkill, setQuestSkill] = useState<Skill>('discipline')
  const [questXp, setQuestXp] = useState(200)
  const [questDue, setQuestDue] = useState('')

  const [showBenchmarkForm, setShowBenchmarkForm] = useState(false)
  const [bSkill, setBSkill] = useState('strength')
  const [bKey, setBKey] = useState('bench_press')
  const [bValue, setBValue] = useState('')
  const [bResult, setBResult] = useState<any>(null)
  const [bLoading, setBLoading] = useState(false)

  useEffect(() => {
    fetchAll()
    fetch('/api/decay', { method: 'POST' })
  }, [])

  async function fetchAll() {
    const [cRes, qRes, lRes, wRes] = await Promise.all([
      fetch('/api/character'),
      fetch('/api/quests'),
      fetch('/api/log'),
      fetch('/api/decay'),
    ])
    setChar(await cRes.json())
    setQuests(await qRes.json())
    setLog(await lRes.json())
    setWarnings((await wRes.json()).warnings ?? [])
  }

  function spawnXpPop(xp: number) {
    const id = ++popCounter.current
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200
    const y = window.innerHeight / 2
    setXpPops(prev => [...prev, { id, xp, x, y }])
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 1600)
  }

  async function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskDesc.trim()) return
    setTaskLoading(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: taskDesc, skill: taskSkill, questId: taskQuest || null }),
      })
      const data = await res.json()
      setLastResult(data)
      spawnXpPop(data.xpEarned)
      setTaskDesc('')
      fetchAll()
    } finally {
      setTaskLoading(false)
    }
  }

  async function submitQuest(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: questTitle, skill: questSkill, xpReward: questXp, dueDate: questDue || null }),
    })
    setQuestTitle(''); setQuestDue(''); setShowQuestForm(false)
    fetchAll()
  }

  async function completeQuest(id: number) {
    await fetch('/api/quests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'completed' }),
    })
    fetchAll()
  }

  async function submitBenchmark(e: React.FormEvent) {
    e.preventDefault()
    setBLoading(true); setBResult(null)
    const res = await fetch('/api/benchmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill: bSkill, benchmarkKey: bKey, value: parseFloat(bValue) }),
    })
    setBResult(await res.json())
    setBLoading(false)
    if (res.ok) fetchAll()
  }

  async function fetchPlan() {
    setPlanLoading(true)
    const res = await fetch('/api/plan')
    const data = await res.json()
    setPlan(data.plan)
    setPlanLoading(false)
  }

  if (!char) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ color: '#7c3aed', fontSize: '2rem' }}>⚔️ Loading your adventure...</div>
    </div>
  )

  const activeQuests = quests.filter(q => q.status === 'active')

  return (
    <div style={{ minHeight: '100vh' }}>
      {xpPops.map(p => (
        <div key={p.id} className="xp-pop" style={{ left: p.x, top: p.y }}>+{p.xp} XP ✨</div>
      ))}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 56 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa', marginRight: 'auto' }}>⚔️ Life RPG</span>
          {(['dashboard', 'quests', 'skills', 'log'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              background: tab === t ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: tab === t ? '#a78bfa' : '#64748b',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Decay Warnings */}
        {warnings.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {warnings.map(w => (
              <div key={w.skill} className="decay-warning" style={{ fontSize: '0.85rem' }}>
                ⚠️ {w.emoji} <strong>{w.label}</strong> decays in {w.daysLeft === 0 ? 'less than a day' : `${w.daysLeft} day`}!
              </div>
            ))}
          </div>
        )}

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Character Card */}
            <div className="panel" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: '4rem', flexShrink: 0 }}>{char.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{char.name}</h1>
                  <span className="level-badge">LVL {char.xpProgress.level}</span>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{char.class}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
                    <span>{char.xpProgress.current.toLocaleString()} / {char.xpProgress.needed.toLocaleString()} XP to next level</span>
                    <span>{char.xpProgress.percent}%</span>
                  </div>
                  <div className="xp-bar"><div className="xp-fill" style={{ width: `${char.xpProgress.percent}%` }} /></div>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total XP: {char.total_xp.toLocaleString()}</div>
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="panel" style={{ borderColor: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>+{lastResult.xpEarned} XP earned</span>
                  {lastResult.levelUp && (
                    <span className="level-up-anim" style={{ color: '#f59e0b', fontWeight: 800 }}>
                      🎉 LEVEL UP! {lastResult.levelUp.from} → {lastResult.levelUp.to}
                    </span>
                  )}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>{lastResult.flavor}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>{lastResult.reasoning}</div>
              </div>
            )}

            {/* Log Task */}
            <div className="panel">
              <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>⚡ Log a Task</h2>
              <form onSubmit={submitTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="What did you do? Be specific — e.g. 'Ran 5km in 28 minutes' or 'Read 30 pages of Atomic Habits'"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <select value={taskSkill} onChange={e => setTaskSkill(e.target.value as Skill)}>
                    {SKILLS.map(s => <option key={s} value={s}>{SKILL_META[s].emoji} {SKILL_META[s].label}</option>)}
                  </select>
                  <select value={taskQuest} onChange={e => setTaskQuest(e.target.value)}>
                    <option value="">No quest (free task)</option>
                    {activeQuests.map(q => <option key={q.id} value={q.id}>📜 {q.title}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={taskLoading || !taskDesc.trim()}>
                  {taskLoading ? '⏳ AI is scoring your task...' : '⚔️ Complete Task & Earn XP'}
                </button>
              </form>
            </div>

            {/* Daily Plan */}
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🗺️ Daily Quest Plan</h2>
                <button className="btn-ghost" onClick={fetchPlan} disabled={planLoading} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  {planLoading ? '⏳ Thinking...' : '✦ Generate'}
                </button>
              </div>
              {plan
                ? <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{plan}</p>
                : <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Click Generate to get your AI Game Master's battle plan for today.</p>
              }
            </div>

            {/* Skills Overview */}
            <div className="panel">
              <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>📊 Skills</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {SKILLS.map(skill => {
                  const meta = SKILL_META[skill]
                  const level = char.skillLevels[skill] ?? 0
                  const xp = (char.skills as any)[`${skill}_xp`] ?? 0
                  return (
                    <div key={skill} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>{meta.emoji} {meta.label}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Lv.{level}</span>
                      </div>
                      <div className="xp-bar">
                        <div style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', height: '100%', width: `${Math.min(100, (level % 10) * 10 + 5)}%`, borderRadius: 999, transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* QUESTS */}
        {tab === 'quests' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>📜 Quest Log</h2>
              <button className="btn-primary" onClick={() => setShowQuestForm(!showQuestForm)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                {showQuestForm ? 'Cancel' : '+ New Quest'}
              </button>
            </div>

            {showQuestForm && (
              <div className="panel">
                <h3 style={{ margin: '0 0 14px', fontSize: '1rem' }}>Create New Quest</h3>
                <form onSubmit={submitQuest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input value={questTitle} onChange={e => setQuestTitle(e.target.value)} placeholder="Quest title — e.g. 'Run a 5K race'" required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <select value={questSkill} onChange={e => setQuestSkill(e.target.value as Skill)}>
                      {SKILLS.map(s => <option key={s} value={s}>{SKILL_META[s].emoji} {SKILL_META[s].label}</option>)}
                    </select>
                    <input type="number" value={questXp} onChange={e => setQuestXp(Number(e.target.value))} placeholder="XP reward" min={50} max={2000} />
                    <input type="date" value={questDue} onChange={e => setQuestDue(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary">Create Quest</button>
                </form>
              </div>
            )}

            <div>
              <h3 style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Active</h3>
              {activeQuests.length === 0
                ? <div style={{ color: '#64748b', padding: '20px 0' }}>No active quests. Create one to begin your journey.</div>
                : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {activeQuests.map(q => (
                      <div key={q.id} className="quest-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, marginBottom: 2 }}>{q.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {SKILL_META[q.skill as Skill]?.emoji} {SKILL_META[q.skill as Skill]?.label}
                            {' · '}{q.xp_reward} XP
                            {q.due_date && ` · Due ${new Date(q.due_date).toLocaleDateString()}`}
                          </div>
                        </div>
                        <button className="btn-ghost" style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }} onClick={() => completeQuest(q.id)}>
                          ✓ Complete
                        </button>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            {quests.filter(q => q.status === 'completed').length > 0 && (
              <div>
                <h3 style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 10px' }}>Completed</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {quests.filter(q => q.status === 'completed').map(q => (
                    <div key={q.id} className="quest-card" style={{ opacity: 0.5 }}>
                      <span style={{ marginRight: 8 }}>✓</span>
                      <span style={{ textDecoration: 'line-through' }}>{q.title}</span>
                      <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: 8 }}>+{q.xp_reward} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SKILLS */}
        {tab === 'skills' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>💪 Skill Tree</h2>
              <button className="btn-primary" onClick={() => setShowBenchmarkForm(!showBenchmarkForm)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                {showBenchmarkForm ? 'Cancel' : '🏆 Log Benchmark'}
              </button>
            </div>

            {showBenchmarkForm && (
              <div className="panel">
                <h3 style={{ margin: '0 0 8px', fontSize: '1rem' }}>Log Real-World Benchmark</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 14px' }}>
                  Hit a real performance milestone? Log it here. The AI validates your claim before granting the level.
                </p>
                <form onSubmit={submitBenchmark} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <select value={bSkill} onChange={e => { setBSkill(e.target.value); setBKey(Object.keys(BENCHMARKS_LIST[e.target.value] ?? {})[0] ?? '') }}>
                      {Object.keys(BENCHMARKS_LIST).map(s => <option key={s} value={s}>{SKILL_META[s as Skill]?.emoji} {s}</option>)}
                    </select>
                    <select value={bKey} onChange={e => setBKey(e.target.value)}>
                      {Object.entries(BENCHMARKS_LIST[bSkill] ?? {}).map(([k, v]) => (
                        <option key={k} value={k}>{v.name} ({v.unit})</option>
                      ))}
                    </select>
                    <input type="number" value={bValue} onChange={e => setBValue(e.target.value)} placeholder={`Value in ${BENCHMARKS_LIST[bSkill]?.[bKey]?.unit ?? '...'}`} step="0.1" required />
                  </div>
                  <button type="submit" className="btn-primary" disabled={bLoading}>
                    {bLoading ? '🤖 AI is verifying...' : '✓ Submit Benchmark'}
                  </button>
                </form>
                {bResult && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: bResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${bResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                    {bResult.ok
                      ? <span style={{ color: '#4ade80' }}>✓ Verified! Skill level set to <strong>{bResult.levelGranted}</strong> (was {bResult.previousLevel}). {bResult.reason}</span>
                      : <span style={{ color: '#f87171' }}>✗ {bResult.reason}</span>
                    }
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gap: 14 }}>
              {SKILLS.map(skill => {
                const meta = SKILL_META[skill]
                const level = char.skillLevels[skill] ?? 0
                const xp = (char.skills as any)[`${skill}_xp`] ?? 0
                const lastActive = (char.skills as any)[`${skill}_last_activity`]
                const daysAgo = lastActive ? Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000) : null
                const isDecaying = daysAgo !== null && daysAgo > meta.decayDays

                return (
                  <div key={skill} className="panel" style={{ borderColor: isDecaying ? 'rgba(239,68,68,0.3)' : undefined }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '2rem' }}>{meta.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{meta.label}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            Decays after {meta.decayDays}d inactive
                            {daysAgo !== null && ` · Last active ${daysAgo === 0 ? 'today' : `${daysAgo}d ago`}`}
                            {isDecaying && <span style={{ color: '#ef4444', marginLeft: 6 }}>⚠️ DECAYING</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="level-badge">LVL {level}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>{xp.toLocaleString()} XP</div>
                      </div>
                    </div>
                    <div className="xp-bar">
                      <div style={{ background: isDecaying ? '#ef4444' : 'linear-gradient(90deg, #7c3aed, #a78bfa)', height: '100%', width: `${Math.min(100, (level % 10) * 10 + 5)}%`, borderRadius: 999, transition: 'width 0.6s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* LOG */}
        {tab === 'log' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>📖 Chronicle</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              {log.length === 0 && <div style={{ color: '#64748b' }}>No entries yet. Complete a task to start your story.</div>}
              {log.map(entry => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px',
                  background: '#0e0e18',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  borderLeft: `3px solid ${entry.type === 'decay' ? '#ef4444' : entry.type === 'quest' ? '#f59e0b' : entry.type === 'benchmark' ? '#22c55e' : '#7c3aed'}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.type === 'decay' ? '📉' : entry.type === 'quest' ? '🏆' : entry.type === 'benchmark' ? '📏' : '⚔️'} {entry.entry}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>
                      {entry.skill && (SKILL_META[entry.skill as Skill]?.emoji + ' ' + entry.skill)}
                      {' · '}{new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, fontWeight: 700, fontSize: '0.9rem', color: entry.xp_earned < 0 ? '#ef4444' : '#a78bfa' }}>
                    {entry.xp_earned > 0 ? '+' : ''}{entry.xp_earned} XP
                  </div>
                  {entry.level_up && <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>↑ LVL</div>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
