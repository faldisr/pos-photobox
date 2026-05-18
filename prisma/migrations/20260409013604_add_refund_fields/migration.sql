-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `refundReason` TEXT NULL,
    ADD COLUMN `refundedAt` DATETIME(3) NULL;
