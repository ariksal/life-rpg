import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { generateDailyPlan } from '@/lib/ai'
import { SKILL_META, decayAmount } from '@/lib/xp'

export async function GET() {
  const char = db.prepare('SELECT * FROM character WHERE id = 1').get() as any
  const skills = db.prepare('SELECT * FROM skills WHERE id = 1').get() as any
  const quests = db.prepare(`SELECT title, skill FROM quests WHERE status = 'active' LIMIT 5`).all() as any[]

  const skillLevels: Record<string, number> = {}
  const decayWarnings: string[] = []

  for (const [skill, meta] of Object.entries(SKILL_META)) {
    skillLevels[skill] = skills[skill] ?? 0
    const lost = decayAmount(skills[`${skill}_last_activity`], meta.decayDays, skills[`${skill}_xp`] ?? 0)
    if (lost > 0) decayWarnings.push(`${meta.label} (losing ${lost} XP)`)
  }

  const plan = await generateDailyPlan(char.name, char.level, skillLevels, quests, decayWarnings)
  return NextResponse.json({ plan })
}
