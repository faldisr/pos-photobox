-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `shifts` ADD COLUMN `cashDeposit` DECIMAL(10, 2) NULL,
    ADD COLUMN `cashRemaining` DECIMAL(10, 2) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `transactions_idempotencyKey_key` ON `transactions`(`idempotencyKey`);

