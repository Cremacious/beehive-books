/*
  Warnings:

  - Added the required column `author` to the `Chapter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Chapter" ADD COLUMN     "author" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "bio" TEXT;
