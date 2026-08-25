import { describe, it, expect } from 'vitest'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

describe('db-sync PostgreSQL integration & immutability tests', () => {
  const nonce = Date.now().toString()
  const testWalletAddress = `3Sys7YjHn9n1R3xLp4zQ7wE2kK8mP5vN6tY8uW1z${nonce.slice(-6)}`
  const mockTxSignature = `5k8F3uW9J12v4xY7z6aB8cD1eF2gH3jK4mL5mN6oP7qR8sT9uV1wX2yZ3aB4cD5eF6gH7jK8mL9mN1oP2qR${nonce.slice(-6)}`

  it('enforces PostgreSQL immutability triggers on Purchase and Claim records', async () => {
    // 1. Create test wallet and purchase directly
    const wallet = await db.wallet.create({
      data: { address: testWalletAddress },
    })

    const purchase = await db.purchase.create({
      data: {
        walletId: wallet.id,
        txSignature: mockTxSignature,
        instructionIndex: 0,
        roundId: 1,
        amountUsdc: new Prisma.Decimal('100.000000000000000000'),
        amountGaia: new Prisma.Decimal('12500.000000000000000000'),
        currency: 'USDC',
        status: 'CONFIRMED',
      },
    })

    expect(purchase.id).toBeDefined()

    // 2. Attempt UPDATE on Purchase -> Must fail due to PostgreSQL trigger!
    await expect(
      db.$executeRawUnsafe(`UPDATE "Purchase" SET "amountUsdc" = 200 WHERE "id" = '${purchase.id}';`)
    ).rejects.toThrow(/immutable historical facts/)

    // 3. Attempt DELETE on Purchase -> Must fail due to PostgreSQL trigger!
    await expect(
      db.$executeRawUnsafe(`DELETE FROM "Purchase" WHERE "id" = '${purchase.id}';`)
    ).rejects.toThrow(/immutable historical facts/)

    // 4. Create test claim
    const claim = await db.claim.create({
      data: {
        walletId: wallet.id,
        txSignature: mockTxSignature,
        instructionIndex: 1,
        amountGaia: new Prisma.Decimal('3125.000000000000000000'),
        status: 'CONFIRMED',
      },
    })

    expect(claim.id).toBeDefined()

    // 5. Attempt UPDATE on Claim -> Must fail due to PostgreSQL trigger!
    await expect(
      db.$executeRawUnsafe(`UPDATE "Claim" SET "amountGaia" = 5000 WHERE "id" = '${claim.id}';`)
    ).rejects.toThrow(/immutable historical facts/)

    // 6. Attempt DELETE on Claim -> Must fail due to PostgreSQL trigger!
    await expect(
      db.$executeRawUnsafe(`DELETE FROM "Claim" WHERE "id" = '${claim.id}';`)
    ).rejects.toThrow(/immutable historical facts/)
  })

  it('enforces composite uniqueness on (txSignature, instructionIndex)', async () => {
    const wallet = await db.wallet.findUnique({ where: { address: testWalletAddress } })
    expect(wallet).not.toBeNull()

    if (!wallet) return

    // Attempting to create duplicate purchase with same (txSignature, instructionIndex) must throw unique constraint error
    await expect(
      db.purchase.create({
        data: {
          walletId: wallet.id,
          txSignature: mockTxSignature,
          instructionIndex: 0, // Duplicate instructionIndex 0
          roundId: 1,
          amountUsdc: new Prisma.Decimal('100'),
          amountGaia: new Prisma.Decimal('12500'),
          currency: 'USDC',
          status: 'CONFIRMED',
        },
      })
    ).rejects.toThrow()
  })
})
