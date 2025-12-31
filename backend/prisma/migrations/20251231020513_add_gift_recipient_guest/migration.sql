-- AlterTable
ALTER TABLE "events" ADD COLUMN     "giftRecipientGuestId" TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_giftRecipientGuestId_fkey" FOREIGN KEY ("giftRecipientGuestId") REFERENCES "guest_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
