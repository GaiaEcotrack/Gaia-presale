import { NextResponse } from 'next/server'
import { getInvestmentData } from '@/lib/server/db-sync'
import { normalizeWalletAddress } from '@/lib/server/solana-verify'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params
    const normalized = normalizeWalletAddress(wallet)

    if (!normalized) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    const result = await getInvestmentData(normalized)
    if (!result.success) {
      return NextResponse.json(
        { error: result.reason ?? 'Failed to retrieve investment data', isStale: result.isStale },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isStale: result.isStale,
      data: result.data,
    })
  } catch (err) {
    console.error('[API] /api/investment/[wallet] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
