import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { levelFromXp, xpProgress, getCharacterClass, SKILL_META } from '@/lib/xp'

export async function GET() {
  const char = db.prepare('SELECT * FROM character WHERE id = 1').get() as any
  const skills = db.prepare('SELECT * FROM skills WHERE id = 1').get() as any

  const skillLevels: Record<string, number> = {}
  for (const key of Object.keys(SKILL_META)) {
    skillLevels[key] = skills[key] ?? 0
  }

  const progress = xpProgress(char.total_xp)
  const characterClass = getCharacterClass(skillLevels)

  // Update class if changed
  if (char.class !== characterClass) {
    db.prepare('UPDATE character SET class = ? WHERE id = 1').run(characterClass)
  }

  return NextResponse.json({
    ...char,
    class: characterClass,
    level: progress.level,
    xpProgress: progress,
    skills,
    skillLevels,
  })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { name, avatar } = body
  db.prepare('UPDATE character SET name = ?, avatar = ? WHERE id = 1').run(name, avatar)
  return NextResponse.json({ ok: true })
}
