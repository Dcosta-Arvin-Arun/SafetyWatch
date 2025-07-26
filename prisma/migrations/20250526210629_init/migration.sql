/*
  Warnings:

  - You are about to alter the column `trackingId` on the `crimereport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(16)`.

*/
-- AlterTable
ALTER TABLE `crimereport` MODIFY `trackingId` CHAR(16) NOT NULL;
