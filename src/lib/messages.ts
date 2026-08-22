// Centralized user-facing copy (English, per project decision).
// Mirrors the exact semantics of Manual v3.0 §3.3, §3.4 and Cuadro 5.
// Swap point if i18n is introduced later.

export const PURCHASE_MESSAGES = {
  signingTitle: 'Confirm in your wallet',
  signingBody: 'Approve the transaction in your wallet to continue.',
  processingTitle: 'Processing your transaction',
  processingBody: 'This may take a few seconds.',
  pendingTitle: 'Your transaction is being processed by the network.',
  pendingBody: 'The status will update automatically shortly.',
  successTitle: 'Purchase successful!',
  failedTitle: 'Transaction not completed',
  viewOnSolscan: 'View on Solscan',
  copy: 'Copy',
  copied: 'Copied',
  goToDashboard: 'Go to my investment dashboard',
  retry: 'Retry',
  newPurchase: 'New purchase',
  errors: {
    slippage:
      'The price changed during the transaction. Adjust the slippage or try a smaller amount.',
    'insufficient-funds':
      "You don't have enough USDC in your wallet for this purchase.",
    network:
      'There was a connection problem with the Solana network. Please check your connection and try again.',
    'user-rejected': 'Transaction cancelled by the user.',
    contract:
      'Internal error in the sale contract. Our team has been notified. Please try again later.',
    unknown: 'The transaction could not be completed. Please try again.',
  } as Record<string, string>,
} as const

export const CLAIM_MESSAGES = {
  nextUnlockIn: 'Next unlock in:',
  claim: 'Claim',
  claiming: 'Claiming…',
  claimed: 'Claimed',
  allReleasesCompleted: 'All releases completed',
  addTokenToWallet: 'Add token to wallet',
  tokenAlreadyAdded: 'Token already added',
  insufficientSolTooltip: 'Insufficient SOL for network fees',
  gasWarning:
    'Keep a small amount of SOL in your wallet to cover network fees when claiming.',
  gasBlocked:
    "You don't have enough SOL to pay the network fee. Deposit at least 0.005 SOL into your wallet.",
  historyProvisionalNote:
    'Showing claims recorded on this device while you were connected. Full claim history will be available once the backend sync service is live.',
  errors: {
    'insufficient-sol':
      "You don't have enough SOL to pay the network fee. Deposit at least 0.005 SOL into your wallet.",
    'user-rejected': 'Transaction cancelled by the user.',
    network:
      'The Solana network is congested. Please try again in a few seconds.',
    contract:
      'Error in the vesting contract. Our team has been notified. Please try again later.',
    'nothing-to-claim':
      'There are no tokens available to claim right now.',
    'ownership-mismatch':
      'This vesting does not belong to the connected wallet.',
    unknown: 'The claim could not be completed. Please try again.',
  } as Record<string, string>,
} as const

export const VESTING_MESSAGES = {
  locked: 'Locked',
  claimable: 'Claimable',
  claimed: 'Claimed',
  totalAcquired: 'Total acquired',
  vestingActive: 'Vesting active',
  lockLabel: (until: string) => `Full lock until ${until}`,
  noInvestments: "You don't have any investments in Gaia Ecotrack yet.",
  streamflowManagedOnChain:
    'Vesting is managed by this presale program directly on-chain. A Streamflow-managed vault link will be shown here once configured for your purchase.',
} as const

/** SOL fee thresholds from manual §9.3.1 / §9.4.2. */
export const SOL_THRESHOLDS = {
  /** Below this the claim button is disabled. */
  BLOCK: 0.005,
  /** Below this a warning banner is shown. */
  WARN: 0.01,
} as const
