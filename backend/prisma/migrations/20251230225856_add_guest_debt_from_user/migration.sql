-- AlterTable
ALTER TABLE "guest_debts" ADD COLUMN     "fromUserId" TEXT;

-- AddForeignKey
ALTER TABLE "guest_debts" ADD CONSTRAINT "guest_debts_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
