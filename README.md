# ⚔️ Life RPG

Turn your real life into a role-playing game. Log real-world tasks — workouts, study sessions, habits — and an **AI game master (Claude)** scores them into XP, levels up your skills, and holds you accountable as skills *decay* when you neglect them.

> Built on Claude's API (`@anthropic-ai/sdk`), which does the scoring, validation, and coaching.

## How it works
- **Log a task** ("Ran 5km in 28 min") → Claude awards XP based on effort, applies a streak multiplier, and writes RPG flavor text.
- **Level up skills** — Strength, Endurance, Discipline, Knowledge, Finance, Social, Creativity — each with its own XP and level.
- **Skill decay** — neglect a skill and it starts losing XP, with warnings before it does. Consistency *is* the game.
- **Quests** — set your own goals with XP rewards and due dates; complete them for big gains.
- **Benchmarks with AI anti-cheat** — claim a real milestone (e.g. a 100 kg bench) and Claude checks whether it's plausible against your history before granting the level.
- **AI daily plan** — Claude generates a motivating quest plan based on your weakest/decaying skills and active quests.
- **Chronicle** — a full log of everything you've done.

## Why I built it
An experiment in whether game mechanics plus an LLM "game master" can make self-improvement genuinely sticky — and a real exercise in wiring Claude into a stateful app with structured JSON outputs and an anti-cheat validation step.

## Tech stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Anthropic Claude** via `@anthropic-ai/sdk` (Claude Haiku 4.5) — task scoring, benchmark validation, daily planning
- **SQLite** via `better-sqlite3` for persistence
- API routes for character, quests, log, decay, benchmarks, and plan

## Getting started
```bash
npm install
# add your Anthropic API key:
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```
Open http://localhost:3000.

## How this was built
A personal project I built by **directing AI** (Claude): I specified the game mechanics, designed the XP/decay and anti-cheat-validation systems, and verified the behavior — the model wrote the code. A hands-on exercise in wiring Claude into a real, stateful app.

## Status
🚧 Work in progress — the core loop (tasks → XP → levels → decay), quests, benchmarks, and AI planning are functional.
