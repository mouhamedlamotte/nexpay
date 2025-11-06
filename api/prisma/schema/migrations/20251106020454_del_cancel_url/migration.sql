/*
  Warnings:

  - You are about to drop the column `cancel_url` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `cancelUrl` on the `callbacks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "cancel_url",
ADD COLUMN     "failure_url" TEXT;

-- AlterTable
ALTER TABLE "callbacks" DROP COLUMN "cancelUrl";
