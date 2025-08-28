-- DropForeignKey
ALTER TABLE "public"."Book" DROP CONSTRAINT "Book_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
