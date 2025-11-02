/*
  Warnings:

  - The `bodyFormat` column on the `ProviderWebhook` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProviderWebhook" DROP COLUMN "bodyFormat",
ADD COLUMN     "bodyFormat" "bodyFormat";
