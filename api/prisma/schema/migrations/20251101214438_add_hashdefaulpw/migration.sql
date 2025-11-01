-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "hasDefaultPassword" BOOLEAN NOT NULL DEFAULT false;
