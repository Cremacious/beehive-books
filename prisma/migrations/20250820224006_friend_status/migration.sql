-- CreateEnum
CREATE TYPE "public"."FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Friendship" ADD COLUMN     "status" "public"."FriendshipStatus" NOT NULL DEFAULT 'PENDING';
