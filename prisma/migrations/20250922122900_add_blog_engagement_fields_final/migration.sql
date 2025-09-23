/*
  Warnings:

  - You are about to drop the column `linkedinUrl` on the `blogs` table. All the data in the column will be lost.
  - The `claps` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `comments` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `shares` column on the `blogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."blogs" DROP COLUMN "linkedinUrl",
ADD COLUMN     "linkedinArticleUrl" TEXT,
DROP COLUMN "claps",
ADD COLUMN     "claps" INTEGER,
DROP COLUMN "comments",
ADD COLUMN     "comments" INTEGER,
DROP COLUMN "shares",
ADD COLUMN     "shares" INTEGER;
