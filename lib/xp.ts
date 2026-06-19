export const SKILLS = ['strength', 'endurance', 'discipline', 'knowledge', 'finance', 'social', 'creativity'] as const
export type Skill = typeof SKILLS[number]

export const SKILL_META: Record<Skill, { label: string; emoji: string; color: string; decayDays: number }> = {
  strength:   { label: 'Strength',   emoji: '💪', color: 'text-red-400',    decayDays: 3 },
  endurance:  { label: 'Endurance',  emoji: '🏃', color: 'text-orange-400', decayDays: 3 },
  discipline: { label: 'Discipline', emoji: '🧘', color: 'text-yellow-400', decayDays: 2 },
  knowledge:  { label: 'Knowledge',  emoji: '📚', color: 'text-blue-400',   decayDays: 5 },
  finance:    { label: 'Finance',    emoji: '💰', color: 'text-green-400',  decayDays: 7 },
  social:     { label: 'Social',     emoji: '🤝', color: 'text-purple-400', decayDays: 5 },
  creativity: { label: 'Creativity', emoji: '🎨', color: 'text-pink-400',   decayDays: 4 },
}

// XP needed to reach a given level
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 2))
}

// Total XP needed to reach a level from 0
export function totalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) total += xpForLevel(i)
  return total
}

// Get level from total XP
export function levelFromXp(xp: number): number {
  let level = 1
  while (totalXpForLevel(level + 1) <= xp) level++
  return level
}

// XP progress within current level
export function xpProgress(xp: number): { current: number; needed: number; percent: number; level: number } {
  const level = levelFromXp(xp)
  const floorXp = totalXpForLevel(level)
  const nextXp = xpForLevel(level)
  const current = xp - floorXp
  const percent = Math.min(100, Math.floor((current / nextXp) * 100))
  return { current, needed: nextXp, percent, level }
}

// Decay: lose XP per day past the decay window
export function decayAmount(lastActivity: string | null, decayDays: number, currentXp: number): number {
  if (!lastActivity || currentXp <= 0) return 0
  const last = new Date(lastActivity)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  const daysOverdue = daysSince - decayDays
  if (daysOverdue <= 0) return 0
  // Lose 2% of current XP per day overdue, minimum 10 XP/day, max 200 XP/day
  const perDay = Math.max(10, Math.min(200, Math.floor(currentXp * 0.02)))
  return Math.min(currentXp, perDay * daysOverdue)
}

// Character class based on highest skill
export function getCharacterClass(skills: Record<string, number>): string {
  const entries = Object.entries(skills).sort(([, a], [, b]) => b - a)
  const top = entries[0]?.[0] as Skill | undefined
  const classes: Record<Skill, string[]> = {
    strength:   ['Squire', 'Warrior', 'Knight', 'Berserker', 'Champion', 'Warlord'],
    endurance:  ['Jogger', 'Runner', 'Scout', 'Ranger', 'Strider', 'Marathon King'],
    discipline: ['Apprentice', 'Monk', 'Ascetic', 'Stoic', 'Sage', 'Enlightened One'],
    knowledge:  ['Student', 'Scholar', 'Scribe', 'Arcanist', 'Wizard', 'Grand Magus'],
    finance:    ['Trader', 'Merchant', 'Banker', 'Investor', 'Magnate', 'Plutocrat'],
    social:     ['Acquaintance', 'Friend', 'Diplomat', 'Charmer', 'Leader', 'Sovereign'],
    creativity: ['Dabbler', 'Artisan', 'Craftsman', 'Artist', 'Virtuoso', 'Grandmaster'],
  }
  if (!top) return 'Novice'
  const level = skills[top] ?? 0
  const tier = Math.min(5, Math.floor(level / 2))
  return classes[top][tier] ?? classes[top][5]
}
