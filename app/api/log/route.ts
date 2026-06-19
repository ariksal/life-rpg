import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  const logs = db.prepare(`
    SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100
  `).all()
  return NextResponse.json(logs)
}
