-- AlterTable
ALTER TABLE "personal_expenses" ADD COLUMN     "beneficiaryId" TEXT;

-- CreateTable
CREATE TABLE "beneficiaries" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '👤',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_expenses" ADD CONSTRAINT "personal_expenses_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
