import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { SKILL_META, decayAmount, levelFromXp } from '@/lib/xp'
import type { Skill } from '@/lib/xp'

export async function POST() {
  const skills = db.prepare('SELECT * FROM skills WHERE id = 1').get() as any
  const results: { skill: string; lost: number }[] = []

  for (const [skill, meta] of Object.entries(SKILL_META)) {
    const xpCol = `${skill}_xp`
    const lastCol = `${skill}_last_activity`
    const currentXp = skills[xpCol] ?? 0
    const lastActivity = skills[lastCol] ?? null

    const lost = decayAmount(lastActivity, meta.decayDays, currentXp)
    if (lost > 0) {
      const newXp = Math.max(0, currentXp - lost)
      const newLevel = levelFromXp(newXp)
      db.prepare(`UPDATE skills SET "${xpCol}" = ?, "${skill}" = ? WHERE id = 1`).run(newXp, newLevel)
      db.prepare(`
        INSERT INTO activity_log (entry, skill, xp_earned, type)
        VALUES (?, ?, ?, 'decay')
      `).run(`Decay: ${meta.label} inactive for too long`, skill, -lost)
      results.push({ skill, lost })
    }
  }

  return NextResponse.json({ decayed: results })
}

export async function GET() {
  const skills = db.prepare('SELECT * FROM skills WHERE id = 1').get() as any
  const warnings: { skill: string; label: string; emoji: string; daysLeft: number }[] = []

  for (const [skill, meta] of Object.entries(SKILL_META)) {
    const lastCol = `${skill}_last_activity`
    const lastActivity = skills[lastCol] ?? null
    if (!lastActivity) continue

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysLeft = meta.decayDays - daysSince
    if (daysLeft <= 1 && daysLeft >= 0) {
      warnings.push({ skill, label: meta.label, emoji: meta.emoji, daysLeft })
    }
  }

  return NextResponse.json({ warnings })
}
