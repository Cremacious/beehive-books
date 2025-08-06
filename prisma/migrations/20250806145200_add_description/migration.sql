-- AlterTable
ALTER TABLE "public"."Book" ADD COLUMN     "coverImage" TEXT DEFAULT 'https://example.com/default-cover.jpg',
ADD COLUMN     "description" TEXT;
