import type { Config, Round, Purchase } from "./config";

export interface VestingBreakdown {
  claimed: bigint;
  claimable: bigint;
  pending: bigint;
  total: bigint;
  vestedFraction: number;
  cliffPassed: boolean;
  fullyUnlocked: boolean;
}

export function computeVesting(
  purchase: Purchase,
  round: Round,
  config: Config,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): VestingBreakdown {
  const total = purchase.token_amount;
  const claimed = purchase.claimed_amount;

  const tge = Number(config.tge_timestamp);
  const cliff = Number(round.cliff_seconds);
  const duration = Number(round.vesting_duration_seconds);
  const cliffEnd = tge + cliff;

  if (nowSeconds < cliffEnd) {
    return {
      claimed,
      claimable: 0n,
      pending: total - claimed,
      total,
      vestedFraction: total > 0n ? Number(claimed) / Number(total) : 0,
      cliffPassed: false,
      fullyUnlocked: false,
    };
  }

  let vested: bigint;
  if (duration === 0) {
    vested = total;
  } else {
    const timeSinceCliff = Math.min(nowSeconds - cliffEnd, duration);
    vested = (total * BigInt(timeSinceCliff)) / BigInt(duration);
  }

  const claimable = vested > claimed ? vested - claimed : 0n;
  const pending = total - claimed - claimable;
  const vestedFraction = total > 0n ? Number(vested) / Number(total) : 0;
  const fullyUnlocked = claimable === total - claimed;

  return { claimed, claimable, pending, total, vestedFraction, cliffPassed: true, fullyUnlocked };
}
