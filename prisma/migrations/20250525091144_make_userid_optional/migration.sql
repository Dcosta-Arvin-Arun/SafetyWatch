-- DropForeignKey
ALTER TABLE `crimereport` DROP FOREIGN KEY `CrimeReport_userId_fkey`;

-- DropIndex
DROP INDEX `CrimeReport_userId_fkey` ON `crimereport`;

-- AlterTable
ALTER TABLE `crimereport` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `CrimeReport` ADD CONSTRAINT `CrimeReport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
