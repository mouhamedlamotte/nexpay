/*
  Warnings:

  - You are about to drop the column `isActive` on the `ProviderWebhook` table. All the data in the column will be lost.
  - You are about to drop the column `has_valid_config` on the `payment_providers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProviderWebhook" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "payment_providers" DROP COLUMN "has_valid_config",
ADD COLUMN     "hasValidSecretConfig" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasValidWebhookConfig" BOOLEAN NOT NULL DEFAULT false;
