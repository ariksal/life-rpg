import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  const quests = db.prepare(`SELECT * FROM quests ORDER BY created_at DESC`).all()
  return NextResponse.json(quests)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, description, skill, xpReward, dueDate } = body

  const result = db.prepare(`
    INSERT INTO quests (title, description, skill, xp_reward, due_date)
    VALUES (?, ?, ?, ?, ?)
  `).run(title, description ?? null, skill, xpReward ?? 200, dueDate ?? null)

  return NextResponse.json({ id: result.lastInsertRowid, ok: true })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, status } = body

  if (status === 'completed') {
    const quest = db.prepare('SELECT * FROM quests WHERE id = ?').get(id) as any
    if (quest) {
      // Award quest completion bonus XP
      const char = db.prepare('SELECT total_xp FROM character WHERE id = 1').get() as any
      db.prepare('UPDATE character SET total_xp = total_xp + ? WHERE id = 1').run(quest.xp_reward)
      db.prepare(`
        INSERT INTO activity_log (entry, skill, xp_earned, type)
        VALUES (?, ?, ?, 'quest')
      `).run(`Quest completed: ${quest.title}`, quest.skill, quest.xp_reward)
    }
    db.prepare(`UPDATE quests SET status = 'completed', completed_at = datetime('now') WHERE id = ?`).run(id)
  } else {
    db.prepare('UPDATE quests SET status = ? WHERE id = ?').run(status, id)
  }

  return NextResponse.json({ ok: true })
}
