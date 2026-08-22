'use client'

// "Mi inversión" dashboard (manual §6): purchase summary, live vesting state,
// countdown, dynamic claim buttons with gas guards, add-token helper,
// Streamflow/explorer transparency links and claim history.

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  Coins,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/use-wallet'
import {
  INVESTMENTS_REFRESH_MS,
  useInvestments,
} from '@/hooks/use-investments'
import { useSolBalance } from '@/hooks/use-sol-balance'
import { useClaim } from '@/hooks/use-claim'
import { InvestmentSummary } from '@/components/investment/investment-summary'
import { VestingProgress } from '@/components/investment/vesting-progress'
import { VestingTimeline } from '@/components/investment/vesting-timeline'
import { VestingCountdown } from '@/components/investment/vesting-countdown'
import { StreamflowPanel } from '@/components/investment/streamflow-panel'
import { ClaimButton } from '@/components/investment/claim-button'
import { GasWarning } from '@/components/investment/gas-warning'
import { ClaimHistory } from '@/components/investment/claim-history'
import { AddTokenButton } from '@/components/investment/add-token-button'
import { getSolanaExplorerAddressUrl } from '@/lib/solana/explorer'
import { TOKEN_CONFIG } from '@/lib/constants'
import { CLAIM_MESSAGES, VESTING_MESSAGES } from '@/lib/messages'

export default function InvestmentDashboardPage() {
  const { isConnected, connectWallet, address, signerWallet } = useWallet()
  const investments = useInvestments(address)
  const sol = useSolBalance(address)
  const [historyKey, setHistoryKey] = useState(0)

  const claim = useClaim({
    address,
    signerWallet,
    onSuccess: ({ txId, amountClaimed }) => {
      toast.success(CLAIM_MESSAGES.claimed, {
        description: `You claimed ${amountClaimed.toLocaleString()} GAIA tokens.`,
      })
      // Immediate refresh — never wait for the next 30s poll (manual §9.6.3).
      void investments.refresh()
      void sol.refresh(true)
      setHistoryKey((k) => k + 1)
      console.info('[dashboard] claim confirmed:', txId)
    },
  })

  /* ---------------- wallet gate ---------------- */
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen">
        <HeaderSection />
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-4"
            >
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground" aria-hidden />
              <p className="text-muted-foreground">
                Connect your wallet to view your investment.
              </p>
              <Button onClick={connectWallet} className="gap-2 w-full" size="lg">
                <Wallet className="w-4 h-4" aria-hidden />
                Connect Wallet
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    )
  }

  /* ---------------- data states ---------------- */
  const body = (() => {
    if (investments.status === 'loading' || investments.status === 'idle') {
      return (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          Loading your investment…
        </div>
      )
    }

    if (investments.status === 'error') {
      return (
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">
            Could not load your investment data right now.
          </p>
          <Button onClick={() => void investments.refresh()} variant="outline">
            Retry
          </Button>
        </div>
      )
    }

    if (investments.errorKind === 'uninitialized') {
      return (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            Presale is not initialized on-chain yet.
          </p>
        </div>
      )
    }

    if (investments.investments.length === 0) {
      return (
        <div className="text-center py-20 space-y-5 max-w-md mx-auto">
          <Coins className="w-12 h-12 mx-auto text-muted-foreground" aria-hidden />
          <p className="text-lg font-medium">{VESTING_MESSAGES.noInvestments}</p>
          <Button asChild className="gap-2" size="lg">
            <Link href="/buy">
              Buy GAIA
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </Button>
        </div>
      )
    }

    const aggregate = investments.aggregate!
    const config = investments.config!

    return (
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary */}
          <Card title="My investment">
            <InvestmentSummary
              investments={investments.investments}
              aggregate={aggregate}
              config={config}
            />
          </Card>

          {/* Vesting */}
          <Card
            title="Vesting"
            action={
              <button
                type="button"
                onClick={() => void investments.refresh()}
                disabled={investments.refreshing}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Refresh vesting data"
                title={`Auto-refreshes every ${INVESTMENTS_REFRESH_MS / 1000}s`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${investments.refreshing ? 'animate-spin' : ''}`}
                  aria-hidden
                />
                Refresh
              </button>
            }
          >
            <div className="space-y-6">
              <VestingProgress state={aggregate} />

              <div className="space-y-2">
                <p className="text-sm font-medium">Next unlock</p>
                <VestingCountdown target={aggregate.nextRelease?.releaseAt ?? null} />
              </div>

              <VestingTimeline releases={aggregate.releases.slice(-8)} />

              <StreamflowPanel programGaiaVault={config.gaia_vault.toBase58()} />
            </div>
          </Card>

          {/* Claim per purchase */}
          <Card title="Claim">
            <div className="space-y-4">
              {claim.error && (
                <p
                  className="rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-400"
                  role="alert"
                >
                  {claim.error.message}
                  {' '}
                  <button
                    type="button"
                    onClick={claim.reset}
                    className="underline underline-offset-2 hover:opacity-80"
                  >
                    Dismiss
                  </button>
                </p>
              )}

              {investments.investments.map((inv) => (
                <div key={`${inv.purchase.round_id}-${inv.purchase.purchase_number}`} className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-sm">
                      {inv.round.name || `Round #${inv.round.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Claimed {inv.state.claimedAmount.toLocaleString()} /{' '}
                      {inv.state.totalAmount.toLocaleString()} GAIA
                    </p>
                  </div>

                  <VestingProgress state={inv.state} />

                  <GasWarning solBalance={sol.solBalance} />

                  <ClaimButton
                    claimable={inv.state.claimableAmount}
                    nextRelease={inv.state.nextRelease ?? null}
                    fullyClaimed={inv.state.fullyClaimed}
                    roundEnded={
                      inv.round.status === 'Ended' ||
                      Math.floor(Date.now() / 1000) > Number(inv.round.end_time)
                    }
                    solBalance={sol.solBalance}
                    claiming={
                      claim.status === 'checking' ||
                      claim.status === 'signing' ||
                      claim.status === 'processing'
                    }
                    onClaim={() => {
                      void claim.execute({
                        roundId: inv.purchase.round_id,
                        purchaseNumber: inv.purchase.purchase_number,
                      })
                    }}
                  />
                </div>
              ))}

              <AddTokenButton gaiaMint={config.gaia_mint.toBase58()} wallet={address} />
            </div>
          </Card>

          <Card title="Claim history">
            <ClaimHistory wallet={address} refreshKey={historyKey} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">How vesting works</h3>
            <div className="space-y-3">
              <InfoRow icon={<Clock className="w-5 h-5 text-blue-500 mt-0.5" aria-hidden />} title="Cliff period" body="Tokens stay locked until the cliff defined by each round elapses after TGE." />
              <InfoRow icon={<Coins className="w-5 h-5 text-green-500 mt-0.5" aria-hidden />} title="Linear release" body="After the cliff, tokens unlock progressively according to the on-chain schedule." />
              <InfoRow icon={<Shield className="w-5 h-5 text-purple-500 mt-0.5" aria-hidden />} title="On-chain claims" body="Every claim is a Solana transaction you sign — verify it on the explorer." />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Quick links</h3>
            <a
              href={getSolanaExplorerAddressUrl(TOKEN_CONFIG.contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-blue-500" aria-hidden />
              <div>
                <p className="font-medium text-sm">Program on Explorer</p>
                <p className="text-xs text-muted-foreground">Verify presale contract state</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  })()

  return (
    <div className="min-h-screen">
      <HeaderSection />
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{body}</div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function HeaderSection() {
  return (
    <section className="py-14 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-bold mb-4"
        >
          My investment
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Track your {TOKEN_CONFIG.symbol} purchases, vesting schedule and claim
          unlocked tokens at any time.
        </motion.p>
      </div>
    </section>
  )
}

function Card({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 pb-0 mb-0">
        <div className="flex items-center justify-between pb-4">
          <h2 className="font-semibold text-lg">{title}</h2>
          {action}
        </div>
      </div>
      <div className="p-6 pt-4">{children}</div>
    </div>
  )
}

function InfoRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      {icon}
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
