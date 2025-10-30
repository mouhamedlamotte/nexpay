/*
  Warnings:

  - A unique constraint covering the columns `[projectId,url]` on the table `webhooks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."webhooks_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "webhooks_projectId_url_key" ON "webhooks"("projectId", "url");
