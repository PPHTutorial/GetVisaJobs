-- CreateEnum
CREATE TYPE "public"."SalaryMode" AS ENUM ('COMPETITIVE', 'FIXED', 'RANGE');

-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "salaryMode" "public"."SalaryMode" NOT NULL DEFAULT 'RANGE';
