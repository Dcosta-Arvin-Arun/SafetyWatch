/*
  Warnings:

  - You are about to drop the column `createdAt` on the `crimereport` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `crimereport` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `crimereport` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackingId]` on the table `CrimeReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `incidentDate` to the `CrimeReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incidentTime` to the `CrimeReport` table without a default value. This is not possible if the table is not empty.
  - Made the column `geoPoint` on table `crimereport` required. This step will fail if there are existing NULL values in that column.
  - Made the column `incidentDateTime` on table `crimereport` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `crimereport` DROP COLUMN `createdAt`,
    DROP COLUMN `date`,
    DROP COLUMN `time`,
    ADD COLUMN `incidentDate` VARCHAR(191) NOT NULL,
    ADD COLUMN `incidentTime` VARCHAR(191) NOT NULL,
    MODIFY `geoPoint` JSON NOT NULL,
    MODIFY `incidentDateTime` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`;

-- CreateIndex
CREATE UNIQUE INDEX `CrimeReport_trackingId_key` ON `CrimeReport`(`trackingId`);
