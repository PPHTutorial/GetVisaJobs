-- AlterTable
ALTER TABLE "public"."blogs" ADD COLUMN     "claps" TEXT,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "readTime" TEXT,
ADD COLUMN     "shares" TEXT;
