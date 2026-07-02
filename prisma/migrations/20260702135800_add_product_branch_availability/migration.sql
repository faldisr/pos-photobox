-- CreateTable
CREATE TABLE `_PackageBranches` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PackageBranches_AB_unique`(`A`, `B`),
    INDEX `_PackageBranches_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TemplateBranches` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_TemplateBranches_AB_unique`(`A`, `B`),
    INDEX `_TemplateBranches_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AddOnBranches` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AddOnBranches_AB_unique`(`A`, `B`),
    INDEX `_AddOnBranches_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PackageBranches` ADD CONSTRAINT `_PackageBranches_A_fkey` FOREIGN KEY (`A`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PackageBranches` ADD CONSTRAINT `_PackageBranches_B_fkey` FOREIGN KEY (`B`) REFERENCES `packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TemplateBranches` ADD CONSTRAINT `_TemplateBranches_A_fkey` FOREIGN KEY (`A`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TemplateBranches` ADD CONSTRAINT `_TemplateBranches_B_fkey` FOREIGN KEY (`B`) REFERENCES `templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AddOnBranches` ADD CONSTRAINT `_AddOnBranches_A_fkey` FOREIGN KEY (`A`) REFERENCES `add_ons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AddOnBranches` ADD CONSTRAINT `_AddOnBranches_B_fkey` FOREIGN KEY (`B`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
