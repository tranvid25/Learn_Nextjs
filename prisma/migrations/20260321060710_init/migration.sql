/*
  Warnings:

  - You are about to drop the column `type` on the `ProductImage` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FOOD', 'DRINK', 'OTHER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'FOOD';

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ImageType";
