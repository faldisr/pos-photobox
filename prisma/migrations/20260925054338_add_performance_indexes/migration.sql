-- CreateIndex
CREATE INDEX `customers_lastVisit_idx` ON `customers`(`lastVisit`);

-- CreateIndex
CREATE INDEX `customers_totalSpent_idx` ON `customers`(`totalSpent`);

-- CreateIndex
CREATE INDEX `customers_createdAt_idx` ON `customers`(`createdAt`);

-- CreateIndex
CREATE INDEX `transactions_branchId_createdAt_idx` ON `transactions`(`branchId`, `createdAt`);

-- CreateIndex
CREATE INDEX `transactions_cashierId_createdAt_idx` ON `transactions`(`cashierId`, `createdAt`);

