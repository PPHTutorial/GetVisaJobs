-- AlterTable
ALTER TABLE "public"."employer_profiles" ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "employeeCount" INTEGER,
ADD COLUMN     "followerCount" INTEGER,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "revenue" TEXT,
ADD COLUMN     "specialties" TEXT[];
