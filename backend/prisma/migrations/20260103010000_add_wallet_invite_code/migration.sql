-- AlterTable
ALTER TABLE "wallets" ADD COLUMN "inviteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_inviteCode_key" ON "wallets"("inviteCode");

