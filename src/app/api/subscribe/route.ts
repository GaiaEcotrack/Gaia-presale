import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, source = 'pre-launch' } = body

    // Validate
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const validSources = ['pre-launch', 'newsletter']
    const normalizedSource = validSources.includes(source) ? source : 'pre-launch'

    // Upsert — no error if email already exists
    await db.subscriber.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {},
      create: {
        email: email.trim().toLowerCase(),
        source: normalizedSource,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[subscribe] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
