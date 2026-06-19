import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getBenchmarkLevel, BENCHMARKS, LOWER_IS_BETTER } from '@/lib/benchmarks'
import { evaluateBenchmark } from '@/lib/ai'
import { levelFromXp } from '@/lib/xp'

export async function GET() {
  const logs = db.prepare('SELECT * FROM benchmarks_log ORDER BY verified_at DESC').all()
  return NextResponse.json({ benchmarks: BENCHMARKS, logs })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { skill, benchmarkKey, value } = body

  const cat = BENCHMARKS[skill]?.[benchmarkKey]
  if (!cat) return NextResponse.json({ error: 'Unknown benchmark' }, { status: 400 })

  // Get history for AI validation
  const history = (db.prepare('SELECT value, benchmark_key FROM benchmarks_log WHERE skill = ? AND benchmark_key = ? ORDER BY verified_at DESC LIMIT 5').all(skill, benchmarkKey) as any[])
    .map(r => `${r.benchmark_key}: ${r.value} ${cat.unit}`)

  const { valid, reason } = await evaluateBenchmark(skill, benchmarkKey, value, cat.unit, history)

  if (!valid) {
    return NextResponse.json({ ok: false, reason }, { status: 422 })
  }

  const levelGranted = getBenchmarkLevel(skill, benchmarkKey, value)
  if (levelGranted === 0) {
    return NextResponse.json({ ok: false, reason: 'Value does not meet minimum benchmark threshold.' }, { status: 400 })
  }

  // Update skill level if this benchmark grants a higher level
  const skills = db.prepare('SELECT * FROM skills WHERE id = 1').get() as any
  const currentLevel = skills[skill] ?? 0

  if (levelGranted > currentLevel) {
    db.prepare(`UPDATE skills SET "${skill}" = ? WHERE id = 1`).run(levelGranted)
    db.prepare(`
      INSERT INTO activity_log (entry, skill, xp_earned, type)
      VALUES (?, ?, ?, 'benchmark')
    `).run(`Benchmark: ${cat.name} ${value}${cat.unit} → Level ${levelGranted}`, skill, 0)
  }

  db.prepare(`
    INSERT INTO benchmarks_log (skill, benchmark_key, value, level_granted)
    VALUES (?, ?, ?, ?)
  `).run(skill, benchmarkKey, value, levelGranted)

  return NextResponse.json({ ok: true, levelGranted, previousLevel: currentLevel, reason })
}
