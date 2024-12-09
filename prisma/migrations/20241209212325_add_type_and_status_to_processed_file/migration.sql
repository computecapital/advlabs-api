-- CreateEnum
CREATE TYPE "ProcessedFileType" AS ENUM ('TRANSCRIPT', 'REPORT');

-- CreateEnum
CREATE TYPE "ProcessedFileStatus" AS ENUM ('LOADING', 'ERROR', 'SUCCESS');

-- AlterTable
ALTER TABLE "ProcessedFile" ADD COLUMN     "status" "ProcessedFileStatus" NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN     "type" "ProcessedFileType" NOT NULL DEFAULT 'TRANSCRIPT',
ALTER COLUMN "url" DROP NOT NULL;
