-- CreateTable
CREATE TABLE "SessionItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "quantity" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "taxRate" DECIMAL(18,2),
    "taxAmount" DECIMAL(18,2),
    "discount" DECIMAL(18,2),
    "total" DECIMAL(18,2) NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "SessionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionItem" ADD CONSTRAINT "SessionItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
