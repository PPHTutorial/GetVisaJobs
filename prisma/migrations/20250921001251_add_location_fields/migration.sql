/*
  Warnings:

  - You are about to drop the column `imagebanner` on the `events` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EventType" ADD VALUE 'CONFERENCE';
ALTER TYPE "public"."EventType" ADD VALUE 'MEETUP';
ALTER TYPE "public"."EventType" ADD VALUE 'JOB_HUNTING';
ALTER TYPE "public"."EventType" ADD VALUE 'JOB_FAIR';

-- AlterTable
ALTER TABLE "public"."events" DROP COLUMN "imagebanner";
