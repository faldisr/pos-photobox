-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `transactions_idempotencyKey_key` ON `transactions`(`idempotencyKey`);

