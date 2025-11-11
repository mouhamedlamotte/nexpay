-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
