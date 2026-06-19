export type BenchmarkCategory = {
  name: string
  unit: string
  description: string
  levels: { level: number; value: number; label: string }[]
}

export const BENCHMARKS: Record<string, Record<string, BenchmarkCategory>> = {
  strength: {
    bench_press: {
      name: 'Bench Press',
      unit: 'kg',
      description: 'Maximum 1-rep bench press',
      levels: [
        { level: 1, value: 20, label: 'Bar only' },
        { level: 2, value: 40, label: 'Beginner' },
        { level: 3, value: 60, label: 'Novice' },
        { level: 4, value: 75, label: 'Intermediate' },
        { level: 5, value: 90, label: 'Advanced' },
        { level: 6, value: 100, label: 'Strong' },
        { level: 7, value: 115, label: 'Very Strong' },
        { level: 8, value: 130, label: 'Elite' },
        { level: 9, value: 150, label: 'Near-Elite' },
        { level: 10, value: 180, label: 'World Class' },
      ],
    },
    squat: {
      name: 'Squat',
      unit: 'kg',
      description: 'Maximum 1-rep back squat',
      levels: [
        { level: 1, value: 20, label: 'Bar only' },
        { level: 2, value: 50, label: 'Beginner' },
        { level: 3, value: 80, label: 'Novice' },
        { level: 4, value: 100, label: 'Intermediate' },
        { level: 5, value: 120, label: 'Advanced' },
        { level: 6, value: 140, label: 'Strong' },
        { level: 7, value: 160, label: 'Very Strong' },
        { level: 8, value: 185, label: 'Elite' },
        { level: 9, value: 210, label: 'Near-Elite' },
        { level: 10, value: 250, label: 'World Class' },
      ],
    },
    deadlift: {
      name: 'Deadlift',
      unit: 'kg',
      description: 'Maximum 1-rep deadlift',
      levels: [
        { level: 1, value: 40, label: 'Beginner' },
        { level: 2, value: 70, label: 'Developing' },
        { level: 3, value: 100, label: 'Novice' },
        { level: 4, value: 130, label: 'Intermediate' },
        { level: 5, value: 150, label: 'Advanced' },
        { level: 6, value: 175, label: 'Strong' },
        { level: 7, value: 200, label: 'Very Strong' },
        { level: 8, value: 220, label: 'Elite' },
        { level: 9, value: 250, label: 'Near-Elite' },
        { level: 10, value: 300, label: 'World Class' },
      ],
    },
    pullups: {
      name: 'Pull-ups',
      unit: 'reps',
      description: 'Max clean pull-ups in one set',
      levels: [
        { level: 1, value: 1, label: 'First pull-up' },
        { level: 2, value: 3, label: 'Beginner' },
        { level: 3, value: 6, label: 'Developing' },
        { level: 4, value: 10, label: 'Intermediate' },
        { level: 5, value: 15, label: 'Advanced' },
        { level: 6, value: 20, label: 'Strong' },
        { level: 7, value: 25, label: 'Very Strong' },
        { level: 8, value: 30, label: 'Elite' },
        { level: 9, value: 35, label: 'Near-Elite' },
        { level: 10, value: 40, label: 'World Class' },
      ],
    },
  },
  endurance: {
    run_5k: {
      name: '5km Run',
      unit: 'minutes',
      description: '5km run time (lower = better)',
      levels: [
        { level: 1, value: 50, label: 'Just finished' },
        { level: 2, value: 40, label: 'Beginner' },
        { level: 3, value: 35, label: 'Developing' },
        { level: 4, value: 30, label: 'Intermediate' },
        { level: 5, value: 27, label: 'Advanced' },
        { level: 6, value: 25, label: 'Strong' },
        { level: 7, value: 22, label: 'Very Strong' },
        { level: 8, value: 20, label: 'Elite' },
        { level: 9, value: 18, label: 'Near-Elite' },
        { level: 10, value: 16, label: 'World Class' },
      ],
    },
    run_10k: {
      name: '10km Run',
      unit: 'minutes',
      description: '10km run time (lower = better)',
      levels: [
        { level: 1, value: 90, label: 'Just finished' },
        { level: 2, value: 75, label: 'Beginner' },
        { level: 3, value: 65, label: 'Developing' },
        { level: 4, value: 60, label: 'Intermediate' },
        { level: 5, value: 55, label: 'Advanced' },
        { level: 6, value: 50, label: 'Strong' },
        { level: 7, value: 46, label: 'Very Strong' },
        { level: 8, value: 42, label: 'Elite' },
        { level: 9, value: 38, label: 'Near-Elite' },
        { level: 10, value: 34, label: 'World Class' },
      ],
    },
  },
  discipline: {
    meditation_streak: {
      name: 'Meditation Streak',
      unit: 'days',
      description: 'Consecutive days of meditation',
      levels: [
        { level: 1, value: 3, label: 'Starting' },
        { level: 2, value: 7, label: '1 Week' },
        { level: 3, value: 14, label: '2 Weeks' },
        { level: 4, value: 21, label: '3 Weeks' },
        { level: 5, value: 30, label: '1 Month' },
        { level: 6, value: 60, label: '2 Months' },
        { level: 7, value: 90, label: '3 Months' },
        { level: 8, value: 180, label: '6 Months' },
        { level: 9, value: 270, label: '9 Months' },
        { level: 10, value: 365, label: '1 Year' },
      ],
    },
    wake_up_streak: {
      name: 'Early Rise Streak',
      unit: 'days',
      description: 'Consecutive days waking before 7am',
      levels: [
        { level: 1, value: 3, label: 'Starting' },
        { level: 2, value: 7, label: '1 Week' },
        { level: 3, value: 14, label: '2 Weeks' },
        { level: 4, value: 30, label: '1 Month' },
        { level: 5, value: 60, label: '2 Months' },
        { level: 6, value: 90, label: '3 Months' },
        { level: 7, value: 120, label: '4 Months' },
        { level: 8, value: 180, label: '6 Months' },
        { level: 9, value: 270, label: '9 Months' },
        { level: 10, value: 365, label: '1 Year' },
      ],
    },
  },
  knowledge: {
    books_read: {
      name: 'Books Read',
      unit: 'books',
      description: 'Non-fiction books completed this year',
      levels: [
        { level: 1, value: 1, label: 'First book' },
        { level: 2, value: 3, label: 'Reader' },
        { level: 3, value: 6, label: 'Avid Reader' },
        { level: 4, value: 10, label: 'Bookworm' },
        { level: 5, value: 15, label: 'Scholar' },
        { level: 6, value: 20, label: 'Intellectual' },
        { level: 7, value: 26, label: 'Devoted' },
        { level: 8, value: 33, label: 'Sage' },
        { level: 9, value: 40, label: 'Near-Master' },
        { level: 10, value: 52, label: 'Master Reader' },
      ],
    },
  },
  finance: {
    savings_rate: {
      name: 'Monthly Savings Rate',
      unit: '%',
      description: 'Percentage of income saved monthly',
      levels: [
        { level: 1, value: 5, label: 'Starting' },
        { level: 2, value: 10, label: 'Developing' },
        { level: 3, value: 15, label: 'Intermediate' },
        { level: 4, value: 20, label: 'Solid' },
        { level: 5, value: 25, label: 'Strong' },
        { level: 6, value: 30, label: 'Disciplined' },
        { level: 7, value: 40, label: 'Advanced' },
        { level: 8, value: 50, label: 'Elite' },
        { level: 9, value: 60, label: 'FIRE Path' },
        { level: 10, value: 70, label: 'Financially Free' },
      ],
    },
  },
}

// Lower is better for time-based benchmarks
export const LOWER_IS_BETTER = new Set(['run_5k', 'run_10k'])

export function getBenchmarkLevel(skill: string, key: string, value: number): number {
  const cat = BENCHMARKS[skill]?.[key]
  if (!cat) return 0
  const sorted = [...cat.levels]
  const lowerBetter = LOWER_IS_BETTER.has(key)

  if (lowerBetter) {
    // For time-based: lower value = higher level
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (value <= sorted[i].value) return sorted[i].level
    }
    return 0
  } else {
    // For performance-based: higher value = higher level
    let granted = 0
    for (const tier of sorted) {
      if (value >= tier.value) granted = tier.level
    }
    return granted
  }
}
