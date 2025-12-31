-- CreateTable
CREATE TABLE "guest_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_expense_participants" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "guestMemberId" TEXT NOT NULL,

    CONSTRAINT "guest_expense_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_debts" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "fromGuestId" TEXT,
    "toGuestId" TEXT,
    "toUserId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_debts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_expense_participants_expenseId_guestMemberId_key" ON "guest_expense_participants"("expenseId", "guestMemberId");

-- AddForeignKey
ALTER TABLE "guest_members" ADD CONSTRAINT "guest_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_members" ADD CONSTRAINT "guest_members_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_expense_participants" ADD CONSTRAINT "guest_expense_participants_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_expense_participants" ADD CONSTRAINT "guest_expense_participants_guestMemberId_fkey" FOREIGN KEY ("guestMemberId") REFERENCES "guest_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_debts" ADD CONSTRAINT "guest_debts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_debts" ADD CONSTRAINT "guest_debts_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_debts" ADD CONSTRAINT "guest_debts_fromGuestId_fkey" FOREIGN KEY ("fromGuestId") REFERENCES "guest_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_debts" ADD CONSTRAINT "guest_debts_toGuestId_fkey" FOREIGN KEY ("toGuestId") REFERENCES "guest_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_debts" ADD CONSTRAINT "guest_debts_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
