-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_paidById_fkey";

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "paidByGuestId" TEXT,
ALTER COLUMN "paidById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paidByGuestId_fkey" FOREIGN KEY ("paidByGuestId") REFERENCES "guest_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
