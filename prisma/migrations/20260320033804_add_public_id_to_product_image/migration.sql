-- AlterTable
ALTER TABLE "Banner" ALTER COLUMN "type" SET DEFAULT 'HOME';

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "publicId" TEXT NOT NULL DEFAULT '';
