/*
  Warnings:

  - You are about to drop the column `paperSize` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `printType` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `packages` DROP COLUMN `paperSize`,
    DROP COLUMN `printType`;
