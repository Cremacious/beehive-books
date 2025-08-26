-- DropForeignKey
ALTER TABLE "public"."Chapter" DROP CONSTRAINT "Chapter_bookId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
