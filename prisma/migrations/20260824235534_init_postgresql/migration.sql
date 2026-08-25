-- CreateEnum
CREATE TYPE "PaymentCurrency" AS ENUM ('USDC', 'USDT');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "VestingSource" AS ENUM ('ANCHOR', 'STREAMFLOW');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SUCCESS', 'REJECTED', 'ERROR');

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "instructionIndex" INTEGER NOT NULL DEFAULT 0,
    "roundId" INTEGER NOT NULL,
    "amountUsdc" DECIMAL(36,18) NOT NULL,
    "amountGaia" DECIMAL(36,18) NOT NULL,
    "currency" "PaymentCurrency" NOT NULL DEFAULT 'USDC',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'CONFIRMED',
    "blockTime" BIGINT,
    "slot" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "instructionIndex" INTEGER NOT NULL DEFAULT 0,
    "amountGaia" DECIMAL(36,18) NOT NULL,
    "purchaseNumber" BIGINT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'CONFIRMED',
    "blockTime" BIGINT,
    "slot" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VestingPosition" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "totalAmount" DECIMAL(36,18) NOT NULL,
    "unlockedAmount" DECIMAL(36,18) NOT NULL,
    "withdrawnAmount" DECIMAL(36,18) NOT NULL,
    "claimableAmount" DECIMAL(36,18) NOT NULL,
    "lockedAmount" DECIMAL(36,18) NOT NULL,
    "vaultAddress" TEXT,
    "source" "VestingSource" NOT NULL DEFAULT 'ANCHOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VestingPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncAttempt" (
    "id" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "walletAddress" TEXT,
    "operation" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Purchase_walletId_createdAt_idx" ON "Purchase"("walletId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_txSignature_instructionIndex_key" ON "Purchase"("txSignature", "instructionIndex");

-- CreateIndex
CREATE INDEX "Claim_walletId_createdAt_idx" ON "Claim"("walletId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_txSignature_instructionIndex_key" ON "Claim"("txSignature", "instructionIndex");

-- CreateIndex
CREATE UNIQUE INDEX "VestingPosition_purchaseId_key" ON "VestingPosition"("purchaseId");

-- CreateIndex
CREATE INDEX "VestingPosition_walletId_idx" ON "VestingPosition"("walletId");

-- CreateIndex
CREATE INDEX "SyncAttempt_txSignature_idx" ON "SyncAttempt"("txSignature");

-- CreateIndex
CREATE INDEX "SyncAttempt_walletAddress_idx" ON "SyncAttempt"("walletAddress");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VestingPosition" ADD CONSTRAINT "VestingPosition_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VestingPosition" ADD CONSTRAINT "VestingPosition_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CHECK constraints for non-negative financial values
ALTER TABLE "Purchase" ADD CONSTRAINT "check_purchase_amounts_positive" CHECK ("amountUsdc" >= 0 AND "amountGaia" >= 0);
ALTER TABLE "Claim" ADD CONSTRAINT "check_claim_amount_positive" CHECK ("amountGaia" >= 0);
ALTER TABLE "VestingPosition" ADD CONSTRAINT "check_vesting_amounts_positive" CHECK (
  "totalAmount" >= 0 AND
  "unlockedAmount" >= 0 AND
  "withdrawnAmount" >= 0 AND
  "claimableAmount" >= 0 AND
  "lockedAmount" >= 0
);

-- Immutability triggers for historical facts
CREATE OR REPLACE FUNCTION prevent_historical_facts_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Purchase and Claim records are immutable historical facts.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_immutable_trigger
BEFORE UPDATE OR DELETE ON "Purchase"
FOR EACH ROW EXECUTE FUNCTION prevent_historical_facts_modification();

CREATE TRIGGER claim_immutable_trigger
BEFORE UPDATE OR DELETE ON "Claim"
FOR EACH ROW EXECUTE FUNCTION prevent_historical_facts_modification();
