/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Payer` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Payer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payer" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "payment_providers" ADD COLUMN     "has_valid_config" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Payer_phone_key" ON "Payer"("phone");
