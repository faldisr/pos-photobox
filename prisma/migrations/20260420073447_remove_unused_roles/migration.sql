/*
  Warnings:

  - The values [BRANCH_MANAGER,INVENTORY_STAFF] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('SUPER_ADMIN', 'CASHIER') NOT NULL DEFAULT 'CASHIER';
