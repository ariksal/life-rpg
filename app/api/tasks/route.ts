import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { scoreTask } from '@/lib/ai'
import { levelFromXp, xpProgress, SKILL_META } from '@/lib/xp'
import type { Skill } from '@/lib/xp'

export async function GET() {
  const tasks = db.prepare(`
    SELECT t.*, q.title as quest_title
    FROM tasks t
    LEFT JOIN quests q ON t.quest_id = q.id
    ORDER BY t.created_at DESC
    LIMIT 50
  `).all()
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { description, skill, questId } = body

  const char = db.prepare('SELECT * FROM character WHERE id = 1').get() as any
  const skills = db.prepare('SELECT * FROM skills WHERE id = 1').get() as any

  // Calculate streak for this skill
  const lastActivity = skills[`${skill}_last_activity`]
  let streak = 0
  if (lastActivity) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )
    streak = daysSince <= 1 ? (skills[`${skill}_streak`] ?? 0) : 0
  }

  // AI scoring
  const score = await scoreTask(description, skill, levelFromXp(char.total_xp), streak)

  const prevLevel = levelFromXp(char.total_xp)
  const newTotalXp = char.total_xp + score.xp
  const newLevel = levelFromXp(newTotalXp)

  // Update character XP
  db.prepare('UPDATE character SET total_xp = ? WHERE id = 1').run(newTotalXp)

  // Update skill XP and last activity
  const skillXpCol = `${skill}_xp`
  const skillLastCol = `${skill}_last_activity`
  const currentSkillXp = skills[skillXpCol] ?? 0
  const newSkillXp = currentSkillXp + score.xp
  const newSkillLevel = levelFromXp(newSkillXp)

  db.prepare(`UPDATE skills SET "${skillXpCol}" = ?, "${skill}" = ?, "${skillLastCol}" = datetime('now') WHERE id = 1`)
    .run(newSkillXp, newSkillLevel)

  // Insert task record
  const result = db.prepare(`
    INSERT INTO tasks (quest_id, description, skill, ai_xp, ai_reasoning, status, completed_at)
    VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'))
  `).run(questId ?? null, description, skill, score.xp, score.reasoning)

  // Log activity
  const levelUpMsg = newLevel > prevLevel ? `${skill}` : null
  db.prepare(`
    INSERT INTO activity_log (entry, skill, xp_earned, level_up, type)
    VALUES (?, ?, ?, ?, 'task')
  `).run(description, skill, score.xp, levelUpMsg)

  return NextResponse.json({
    taskId: result.lastInsertRowid,
    xpEarned: score.xp,
    reasoning: score.reasoning,
    flavor: score.flavor,
    levelUp: newLevel > prevLevel ? { from: prevLevel, to: newLevel } : null,
    newTotalXp,
    newSkillXp,
    newSkillLevel,
  })
}
