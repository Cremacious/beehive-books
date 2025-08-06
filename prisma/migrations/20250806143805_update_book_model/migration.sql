/*
  Warnings:

  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `coverImage` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Book` table. All the data in the column will be lost.
  - The `id` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Chapter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isPrivate` on the `Chapter` table. All the data in the column will be lost.
  - The `id` column on the `Chapter` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Comment` table. All the data in the column will be lost.
  - The `id` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parentId` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `privacy` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privacy` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `bookId` on the `Chapter` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `authorId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `chapterId` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Chapter" DROP CONSTRAINT "Chapter_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Book" DROP CONSTRAINT "Book_pkey",
DROP COLUMN "coverImage",
DROP COLUMN "description",
DROP COLUMN "isPrivate",
ADD COLUMN     "lastEditedBy" TEXT,
ADD COLUMN     "privacy" TEXT NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'In Progress',
ADD COLUMN     "wordCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "genre" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ADD CONSTRAINT "Book_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Chapter" DROP CONSTRAINT "Chapter_pkey",
DROP COLUMN "isPrivate",
ADD COLUMN     "privacy" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'In Progress',
ADD COLUMN     "wordCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "bookId",
ADD COLUMN     "bookId" INTEGER NOT NULL,
ADD CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "bookId" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "chapterId",
ADD COLUMN     "chapterId" INTEGER NOT NULL,
DROP COLUMN "parentId",
ADD COLUMN     "parentId" INTEGER,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."_BookCollaborators" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookCollaborators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookCollaborators_B_index" ON "public"."_BookCollaborators"("B");

-- AddForeignKey
ALTER TABLE "public"."Book" ADD CONSTRAINT "Book_lastEditedBy_fkey" FOREIGN KEY ("lastEditedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BookCollaborators" ADD CONSTRAINT "_BookCollaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BookCollaborators" ADD CONSTRAINT "_BookCollaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
