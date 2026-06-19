import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type ScoreResult = {
  xp: number
  skill: string
  reasoning: string
  flavor: string
}

export async function scoreTask(
  description: string,
  skill: string,
  characterLevel: number,
  streak: number
): Promise<ScoreResult> {
  const prompt = `You are the AI game master for a real-life RPG app. A player just completed a real-world task. Your job is to award XP.

Player info:
- Overall level: ${characterLevel}
- Current ${skill} streak: ${streak} days

Task completed: "${description}"
Skill category: ${skill}

Rules for XP scoring:
- Base range: 10–500 XP
- Tiny habit (5 min, low effort): 10–30 XP
- Light effort (30 min, moderate task): 30–80 XP
- Solid effort (1 hr, meaningful progress): 80–150 XP
- Hard effort (2+ hrs, challenging): 150–300 XP
- Epic achievement (major milestone): 300–500 XP
- Apply a streak multiplier: +5% per streak day, max +50%
- Higher-level players need more XP for the same tasks to feel earned

Respond with ONLY valid JSON, no markdown:
{
  "xp": <integer>,
  "skill": "<one of: strength, endurance, discipline, knowledge, finance, social, creativity>",
  "reasoning": "<1 sentence explaining the score>",
  "flavor": "<short RPG-style flavor text, e.g. 'Your iron will grows stronger.'>"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text)
  } catch {
    return { xp: 50, skill, reasoning: 'Task logged.', flavor: 'Every step counts.' }
  }
}

export async function evaluateBenchmark(
  skill: string,
  benchmarkKey: string,
  value: number,
  unit: string,
  history: string[]
): Promise<{ valid: boolean; reason: string }> {
  const prompt = `You are validating a real-world performance benchmark claim for a life RPG.

Skill: ${skill}
Benchmark: ${benchmarkKey}
Claimed value: ${value} ${unit}
Player history: ${history.length > 0 ? history.join(', ') : 'No prior benchmarks logged'}

Is this claim plausible given the history? A sudden jump (e.g. 0 to 200kg bench press) should be flagged.
Respond ONLY with valid JSON:
{"valid": true/false, "reason": "<one sentence>"}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text)
  } catch {
    return { valid: true, reason: 'Claim accepted.' }
  }
}

export async function generateDailyPlan(
  characterName: string,
  characterLevel: number,
  skills: Record<string, number>,
  quests: { title: string; skill: string }[],
  decayWarnings: string[]
): Promise<string> {
  const prompt = `You are the AI game master for ${characterName}'s life RPG. Generate a motivating daily quest plan.

Character level: ${characterLevel}
Skills: ${JSON.stringify(skills)}
Active quests: ${quests.map(q => q.title).join(', ') || 'None'}
Decay warnings (skills about to lose XP): ${decayWarnings.join(', ') || 'None'}

Write a short (3-5 sentences) daily plan in RPG game-master voice. Be specific, motivating, and reference their actual quests and weakest skills. End with a battle cry.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : 'Today is a new adventure. Make it count.'
}
