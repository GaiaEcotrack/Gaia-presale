-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "purchaseNumber" BIGINT;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'pre-launch',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- Aggregate vesting position: at most ONE per wallet (purchaseId IS NULL)
CREATE UNIQUE INDEX "VestingPosition_wallet_aggregate_key" ON "VestingPosition"("walletId") WHERE "purchaseId" IS NULL;
