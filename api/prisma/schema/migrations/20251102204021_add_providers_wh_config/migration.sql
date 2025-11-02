-- CreateEnum
CREATE TYPE "WebhookAuthType" AS ENUM ('sharedSecret', 'hmac');

-- CreateEnum
CREATE TYPE "WebhookAlgo" AS ENUM ('sha256');

-- CreateEnum
CREATE TYPE "WebhookEncoding" AS ENUM ('hex', 'base64');

-- CreateEnum
CREATE TYPE "WebhookHeaderPrefix" AS ENUM ('bearer', 'basic');

-- CreateEnum
CREATE TYPE "bodyFormat" AS ENUM ('raw', 'urlencoded', 'timestampPlusBody');

-- CreateTable
CREATE TABLE "ProviderWebhook" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "authType" "WebhookAuthType" NOT NULL,
    "header" TEXT NOT NULL,
    "prefix" "WebhookHeaderPrefix",
    "secret" TEXT NOT NULL,
    "algo" "WebhookAlgo",
    "encoding" "WebhookEncoding",
    "timestampTolerance" INTEGER,
    "bodyFormat" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderWebhook_providerId_key" ON "ProviderWebhook"("providerId");

-- AddForeignKey
ALTER TABLE "ProviderWebhook" ADD CONSTRAINT "ProviderWebhook_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "payment_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
