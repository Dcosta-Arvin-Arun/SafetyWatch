/*
  Warnings:

  - Added the required column `crimeType` to the `CrimeReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `CrimeReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CrimeReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `crimereport` ADD COLUMN `actionDetails` VARCHAR(191) NULL,
    ADD COLUMN `crimeType` VARCHAR(191) NOT NULL,
    ADD COLUMN `geoPoint` JSON NULL,
    ADD COLUMN `images` JSON NULL,
    ADD COLUMN `incidentDateTime` DATETIME(3) NULL,
    ADD COLUMN `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reporterContact` VARCHAR(191) NULL,
    ADD COLUMN `reporterId` VARCHAR(191) NULL,
    ADD COLUMN `reporterName` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `time` VARCHAR(191) NOT NULL,
    ADD COLUMN `trackingId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
