-- AlterTable
ALTER TABLE "payment_providers" ADD COLUMN     "hasWebhookTestPassed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hastSecretTestPassed" BOOLEAN NOT NULL DEFAULT false;
