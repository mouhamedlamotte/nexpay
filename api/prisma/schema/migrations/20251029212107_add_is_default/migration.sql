/*
  Warnings:

  - You are about to drop the column `isDefault` on the `webhooks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "webhooks" DROP COLUMN "isDefault";
