-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_chapterId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
