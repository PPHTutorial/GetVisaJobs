-- CreateEnum
CREATE TYPE "public"."ApplicationMethod" AS ENUM ('EXTERNAL', 'INTERNAL');

-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "applicationMethod" "public"."ApplicationMethod" NOT NULL DEFAULT 'INTERNAL';
