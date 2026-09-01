-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "nights" INTEGER,
    "hours" INTEGER,
    "guests" INTEGER NOT NULL,
    "name" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE INDEX "Booking_facility_date_idx" ON "Booking"("facility", "date");
