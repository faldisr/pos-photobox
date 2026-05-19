/*
 Navicat Premium Data Transfer

 Source Server         : DB Aplikasi Lokal
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3)
 Source Host           : localhost:3306
 Source Schema         : pos_photobox

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3)
 File Encoding         : 65001

 Date: 19/05/2026 13:47:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _prisma_migrations
-- ----------------------------
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) NULL DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `rolled_back_at` datetime(3) NULL DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of _prisma_migrations
-- ----------------------------
INSERT INTO `_prisma_migrations` VALUES ('00a9fb20-bd6e-4f4c-b270-43fd05956f4e', '521cfdea42e61d063f9aa6c5b4c2be2c4be4e14d3688ea9f1cc27c86db8b9589', '2026-04-23 09:24:49.348', '20260423092449_add_queue_number', NULL, NULL, '2026-04-23 09:24:49.169', 1);
INSERT INTO `_prisma_migrations` VALUES ('11cb7847-afe9-46b7-808c-061232709dc0', '292bf9252efbd4e2087802b083a592421927f1e6922355181fafc69de3f0444e', '2026-03-30 02:42:54.163', '20260330024253_add_inventory_log', NULL, NULL, '2026-03-30 02:42:53.797', 1);
INSERT INTO `_prisma_migrations` VALUES ('1fe3b516-b91a-4c97-95a3-ed7e2bc38b83', '17ff9271735d68701b06121fde8f2d58da01faea5a1bfd8cb63897b59eb580ac', '2026-02-20 03:23:34.388', '20260220032333_add_image_url_to_package_addon', NULL, NULL, '2026-02-20 03:23:33.960', 1);
INSERT INTO `_prisma_migrations` VALUES ('2b5fa167-6bf7-4bcc-aab2-2fe12739f161', 'a608c137215f5e741dd635a6d4164bf2211d027109e598bf9e61e3a13cc23166', '2026-04-20 07:37:04.504', '20260420073447_remove_unused_roles', NULL, NULL, '2026-04-20 07:37:04.137', 1);
INSERT INTO `_prisma_migrations` VALUES ('2ecec574-38d5-451f-b7f2-1f49aa1231dc', 'e70c81f8d6617c323f84b96fc730d7915a0e61d15c6d1a6f48ea1d9d46269ab0', '2026-04-15 08:37:52.885', '20260415083752_add_username_to_user', NULL, NULL, '2026-04-15 08:37:52.704', 1);
INSERT INTO `_prisma_migrations` VALUES ('41cbbc3d-07ee-497e-a678-91e7cc78a8e7', 'c60801c0c749e2b4fc0efc07a9b9d2f9ca486189eb9a909970cbfa581c3ba74b', '2026-03-30 08:56:30.525', '20260330085630_remove_paper_size_print_type', NULL, NULL, '2026-03-30 08:56:30.262', 1);
INSERT INTO `_prisma_migrations` VALUES ('4728a6cb-fc4b-4588-938b-a412b0447e57', 'd900ee6a9cacec576428844689844f56d4a623504f0253cfa6997a847f8f170a', '2026-04-21 01:52:28.864', '20260421015228_add_is_printed', NULL, NULL, '2026-04-21 01:52:28.761', 1);
INSERT INTO `_prisma_migrations` VALUES ('5dd047ee-609a-4212-b803-496741f92d00', '08b14dcd31c90544e1a7cbb81dca3c15aa44de14a3d29ca236bf74188fb7cc63', '2026-02-12 02:31:13.588', '20260211030926_init', NULL, NULL, '2026-02-12 02:31:06.409', 1);
INSERT INTO `_prisma_migrations` VALUES ('6f3cdcab-149f-4894-907b-d954d3b294e3', 'a608c137215f5e741dd635a6d4164bf2211d027109e598bf9e61e3a13cc23166', NULL, '20260420073447_remove_unused_roles', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260420073447_remove_unused_roles\n\nDatabase error code: 1265\n\nDatabase error:\nData truncated for column \'role\' at row 2\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260420073447_remove_unused_roles\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260420073447_remove_unused_roles\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260', '2026-04-20 07:36:29.281', '2026-04-20 07:34:47.612', 0);
INSERT INTO `_prisma_migrations` VALUES ('abb75b82-bc62-4c7a-ad12-a72b5d4dea85', '904e1b0490f6443ffda9ef05cb357e4b66994fe7b26f687c4fd48f3aa1b6702b', '2026-05-18 07:22:19.040', '20260518072218_remove_promo_dates', NULL, NULL, '2026-05-18 07:22:18.981', 1);
INSERT INTO `_prisma_migrations` VALUES ('bf13c40c-8461-4077-a077-7d8cb7897d75', '6c03a5a3af184d7b80bc345bc236b1b049475afcf1d955f7989b44a02596fe5c', '2026-04-09 01:36:04.150', '20260409013604_add_refund_fields', NULL, NULL, '2026-04-09 01:36:04.056', 1);
INSERT INTO `_prisma_migrations` VALUES ('dcfb1944-7465-4160-9059-d7c13b9f7616', 'f4a771f30ac6439734c803b0b92dbe4859f0fbc07b66c83a1624e9907a61ea16', '2026-04-06 02:14:50.933', '20260406021450_add_session_token_remove_unused', NULL, NULL, '2026-04-06 02:14:50.536', 1);

-- ----------------------------
-- Table structure for add_ons
-- ----------------------------
DROP TABLE IF EXISTS `add_ons`;
CREATE TABLE `add_ons`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('EXTRA_PRINT','FRAME','DIGITAL_FILE','PROPS','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `imageUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `add_ons_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of add_ons
-- ----------------------------

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changes` json NULL,
  `ipAddress` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `userAgent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `audit_logs_userId_idx`(`userId` ASC) USING BTREE,
  INDEX `audit_logs_entity_entityId_idx`(`entity` ASC, `entityId` ASC) USING BTREE,
  INDEX `audit_logs_createdAt_idx`(`createdAt` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------

-- ----------------------------
-- Table structure for branch_pricing
-- ----------------------------
DROP TABLE IF EXISTS `branch_pricing`;
CREATE TABLE `branch_pricing`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `branchId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `packageId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `addOnId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` decimal(10, 2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `branch_pricing_branchId_packageId_key`(`branchId` ASC, `packageId` ASC) USING BTREE,
  UNIQUE INDEX `branch_pricing_branchId_addOnId_key`(`branchId` ASC, `addOnId` ASC) USING BTREE,
  INDEX `branch_pricing_branchId_idx`(`branchId` ASC) USING BTREE,
  INDEX `branch_pricing_packageId_idx`(`packageId` ASC) USING BTREE,
  INDEX `branch_pricing_addOnId_idx`(`addOnId` ASC) USING BTREE,
  CONSTRAINT `branch_pricing_addOnId_fkey` FOREIGN KEY (`addOnId`) REFERENCES `add_ons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `branch_pricing_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of branch_pricing
-- ----------------------------

-- ----------------------------
-- Table structure for branches
-- ----------------------------
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `city` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `province` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `postalCode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `operationalHours` json NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `branches_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of branches
-- ----------------------------
INSERT INTO `branches` VALUES ('cmliw7iwk0000vl3ga1yddgl9', 'Cabang Utama', 'MAIN', 'Jl. Sudirman No. 123', '021-12345678', 'main@photobox.com', 'Jakarta Pusat', 'DKI Jakarta', '10110', 1, '{\"friday\": {\"open\": \"09:00\", \"close\": \"21:00\"}, \"monday\": {\"open\": \"09:00\", \"close\": \"21:00\"}, \"sunday\": {\"open\": \"10:00\", \"close\": \"22:00\"}, \"tuesday\": {\"open\": \"09:00\", \"close\": \"21:00\"}, \"saturday\": {\"open\": \"10:00\", \"close\": \"22:00\"}, \"thursday\": {\"open\": \"09:00\", \"close\": \"21:00\"}, \"wednesday\": {\"open\": \"09:00\", \"close\": \"21:00\"}}', '2026-02-12 03:22:08.945', '2026-02-12 03:22:08.945');
INSERT INTO `branches` VALUES ('cmliw7jc10001vl3gg2945qtx', 'Tasik Plaza', 'TSK', 'Jl. BSD Raya No. 456', '021-87654321', 'orijin@photobox.com', 'Tasik', 'Jawa Barat', '15310', 1, 'null', '2026-02-12 03:22:09.696', '2026-04-16 02:35:29.969');
INSERT INTO `branches` VALUES ('cmnfdtnaa0000vlqgf11ipjw5', 'Orijin Uber', 'BDG', 'JL. Ujung Berung', '08576422313', 'orijinuber@email.com', 'Bandung', 'Jawa Barat', '130423', 1, '\"Setiap Hari 09:00 - 22:00\"', '2026-04-01 01:43:34.677', '2026-04-01 01:43:34.677');
INSERT INTO `branches` VALUES ('cmo0vb0bg0000vly8yiz0b5f6', 'Sukabumi Plaza', 'SKBM', 'jalan sukabumi raya', '08977238131', 'orijin@gmail.com', 'Bandung', 'Jawa Barat', '993832', 1, 'null', '2026-04-16 02:36:07.848', '2026-04-16 02:36:07.848');
INSERT INTO `branches` VALUES ('cmo0vc5ud0001vly8m2q8ug21', 'Malang Plaza', 'MLG', 'JL. Malang Raya', '0823138848141', 'orijin@gmail.com', 'Malang ', 'Jawa Timur', '99832', 1, 'null', '2026-04-16 02:37:01.717', '2026-04-16 02:37:01.717');
INSERT INTO `branches` VALUES ('cmo0vdgeb0002vly80ude7pft', 'Blok M Jaksel', 'JKT', 'Jl. Blok M no 119 ', '08733134141', 'orijin@gmail.com', 'Jakarta', 'DKI Jakarta', '882371', 1, 'null', '2026-04-16 02:38:02.051', '2026-04-16 02:38:02.051');
INSERT INTO `branches` VALUES ('cmo0vecrc0003vly8k1tcz338', 'Cimahi Mall', 'CMH', 'JL. Cimahi Raya no 118', '098773133133', 'orijin@gmail.com', 'Cimahi', 'Jawa Barat', '88230', 1, 'null', '2026-04-16 02:38:43.993', '2026-04-16 02:38:43.993');

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `dateOfBirth` datetime(3) NULL DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `loyaltyPoints` int NOT NULL DEFAULT 0,
  `totalVisits` int NOT NULL DEFAULT 0,
  `totalSpent` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `lastVisit` datetime(3) NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `customers_phone_key`(`phone` ASC) USING BTREE,
  INDEX `customers_phone_idx`(`phone` ASC) USING BTREE,
  INDEX `customers_email_idx`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customers
-- ----------------------------
INSERT INTO `customers` VALUES ('cmo0vtb08000vvly82xrtopnn', 'Sidiq', NULL, '089763131414', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-16 02:50:21.558', '2026-04-16 02:50:21.560', '2026-04-16 02:50:21.560');
INSERT INTO `customers` VALUES ('cmo0vz61j0014vly8ujxcqblr', 'Azril', NULL, '08923314451', NULL, NULL, NULL, 0, 1, 50000.00, '2026-04-16 02:54:55.061', '2026-04-16 02:54:55.063', '2026-04-16 02:54:55.063');
INSERT INTO `customers` VALUES ('cmo0yi25l001bvly8bqx1hc2a', 'arsan', NULL, '08977899231', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-16 04:05:35.650', '2026-04-16 04:05:35.717', '2026-04-16 04:05:35.717');
INSERT INTO `customers` VALUES ('cmo5u4tl50002vlg8chy69mzg', 'caca', NULL, '463463632', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-19 14:02:10.497', '2026-04-19 14:02:10.506', '2026-04-19 14:02:10.506');
INSERT INTO `customers` VALUES ('cmo5ue8s4000evlg84xaouwoh', 'nadivta', NULL, '0924141', NULL, NULL, NULL, 0, 2, 90000.00, '2026-04-19 14:23:35.642', '2026-04-19 14:09:30.101', '2026-04-19 14:23:35.643');
INSERT INTO `customers` VALUES ('cmo7z4n5c0000vl84t3hnxixr', 'asep', NULL, '08923338134', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-21 01:57:32.576', '2026-04-21 01:57:32.579', '2026-04-21 01:57:32.579');
INSERT INTO `customers` VALUES ('cmo9rdv5v0000vl14hyscjw06', 'ade', NULL, '12341414', NULL, NULL, NULL, 0, 1, 40000.00, '2026-04-22 07:56:18.284', '2026-04-22 07:56:18.286', '2026-04-22 07:56:18.286');
INSERT INTO `customers` VALUES ('cmo9rgvy10007vl14ah0d4sd0', 'fadil', NULL, '241441566', NULL, NULL, NULL, 0, 1, 40000.00, '2026-04-22 07:58:39.288', '2026-04-22 07:58:39.289', '2026-04-22 07:58:39.289');
INSERT INTO `customers` VALUES ('cmoa2fwu50000vlww9k8xv0ao', 'ade', NULL, '0988855213', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-22 13:05:49.542', '2026-04-22 13:05:49.548', '2026-04-22 13:05:49.548');
INSERT INTO `customers` VALUES ('cmoawvpec0000vlz0r7bjarjj', 'adli', NULL, '0888231313', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-23 03:17:54.877', '2026-04-23 03:17:54.880', '2026-04-23 03:17:54.880');
INSERT INTO `customers` VALUES ('cmoax8c1o0002vllcw0xjrir8', 'afa', NULL, '1242141551', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-23 03:27:44.121', '2026-04-23 03:27:44.124', '2026-04-23 03:27:44.124');
INSERT INTO `customers` VALUES ('cmoaxbl120009vllcxywyjv4m', 'ara', NULL, '2313131231', NULL, NULL, NULL, 0, 1, 40000.00, '2026-04-23 03:30:15.732', '2026-04-23 03:30:15.734', '2026-04-23 03:30:15.734');
INSERT INTO `customers` VALUES ('cmoaxq7h30000vlmgkgc2x3e2', 'ade', NULL, '11323231313', NULL, NULL, NULL, 0, 1, 40000.00, '2026-04-23 03:41:38.006', '2026-04-23 03:41:38.008', '2026-04-23 03:41:38.008');
INSERT INTO `customers` VALUES ('cmoaxvtfr0009vlmglcvtat27', 'ada', NULL, '24214141412', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-23 03:45:59.750', '2026-04-23 03:45:59.751', '2026-04-23 03:45:59.751');
INSERT INTO `customers` VALUES ('cmoaxx1l2000gvlmgavsgex6z', 'asa', NULL, '424241421', NULL, NULL, NULL, 0, 1, 45000.00, '2026-04-23 03:46:56.965', '2026-04-23 03:46:56.966', '2026-04-23 03:46:56.966');
INSERT INTO `customers` VALUES ('cmoc9t9cb0000vli4czft7s1u', 'ara', NULL, '097863351', NULL, NULL, NULL, 0, 1, 40000.00, '2026-04-24 02:07:41.945', '2026-04-24 02:07:41.951', '2026-04-24 02:07:41.951');
INSERT INTO `customers` VALUES ('cmpbdr22x0001vl5sci455da5', 'adas', NULL, '23213123', NULL, NULL, NULL, 0, 1, 45000.00, '2026-05-18 15:49:53.865', '2026-05-18 15:49:53.866', '2026-05-18 15:49:53.866');

-- ----------------------------
-- Table structure for inventories
-- ----------------------------
DROP TABLE IF EXISTS `inventories`;
CREATE TABLE `inventories`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `branchId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `lastRestockDate` datetime(3) NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `inventories_branchId_itemId_key`(`branchId` ASC, `itemId` ASC) USING BTREE,
  INDEX `inventories_branchId_idx`(`branchId` ASC) USING BTREE,
  INDEX `inventories_itemId_idx`(`itemId` ASC) USING BTREE,
  CONSTRAINT `inventories_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `inventories_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventories
-- ----------------------------
INSERT INTO `inventories` VALUES ('cmo0vle49000ivly8n6ru4oh8', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vle3i000gvly8pyz8bs84', 89, '2026-04-16 02:44:12.343', '2026-04-16 02:44:12.345', '2026-05-18 15:49:53.976');
INSERT INTO `inventories` VALUES ('cmo0vm6hi000lvly81ceoicsf', 'cmo0vdgeb0002vly80ude7pft', 'cmo0vm6hc000jvly867bnv66o', 94, '2026-04-16 02:44:49.109', '2026-04-16 02:44:49.111', '2026-04-23 03:41:38.171');
INSERT INTO `inventories` VALUES ('cmo0vmwm9000ovly85n38qlzi', 'cmo0vb0bg0000vly8yiz0b5f6', 'cmo0vmwm3000mvly83xayc497', 98, '2026-04-16 02:45:22.964', '2026-04-16 02:45:22.977', '2026-04-23 03:46:57.041');
INSERT INTO `inventories` VALUES ('cmo5u9s1v000dvlg829m7ofkh', 'cmo0vdgeb0002vly80ude7pft', 'cmo5u9s1n000bvlg8195msdia', 100, '2026-04-19 14:06:01.786', '2026-04-19 14:06:01.795', '2026-04-19 14:06:01.795');

-- ----------------------------
-- Table structure for inventory_items
-- ----------------------------
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('PAPER','INK','FRAME','PROPS','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `minStock` int NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `unitCost` decimal(10, 2) NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `inventory_items_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_items
-- ----------------------------
INSERT INTO `inventory_items` VALUES ('cmo0vle3i000gvly8pyz8bs84', 'Kertas', 'KRT-4', 'PAPER', 'lembar', 10, 1, 5000.00, '2026-04-16 02:44:12.318', '2026-04-16 02:44:12.318');
INSERT INTO `inventory_items` VALUES ('cmo0vm6hc000jvly867bnv66o', 'Kertas', 'KRT-45', 'PAPER', 'lembar', 10, 1, 4000.00, '2026-04-16 02:44:49.105', '2026-04-16 02:44:49.105');
INSERT INTO `inventory_items` VALUES ('cmo0vmwm3000mvly83xayc497', 'Kertas', 'KRT-SKBM', 'PAPER', 'lembar', 10, 1, 3000.00, '2026-04-16 02:45:22.972', '2026-04-16 02:45:22.972');
INSERT INTO `inventory_items` VALUES ('cmo5u9s1n000bvlg8195msdia', 'kertas', 'kertas photo', 'PAPER', 'lembar', 10, 1, 5000.00, '2026-04-19 14:06:01.788', '2026-04-19 14:06:01.788');

-- ----------------------------
-- Table structure for inventory_logs
-- ----------------------------
DROP TABLE IF EXISTS `inventory_logs`;
CREATE TABLE `inventory_logs`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `type` enum('RESTOCK','SALE','ADJUSTMENT','RETURN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `quantityBefore` int NOT NULL,
  `quantityAfter` int NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdBy` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `inventory_logs_itemId_idx`(`itemId` ASC) USING BTREE,
  INDEX `inventory_logs_transactionId_idx`(`transactionId` ASC) USING BTREE,
  INDEX `inventory_logs_createdAt_idx`(`createdAt` ASC) USING BTREE,
  CONSTRAINT `inventory_logs_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_logs
-- ----------------------------
INSERT INTO `inventory_logs` VALUES ('cmo0vtb480011vly8fmjzb2s3', 'cmo0vle3i000gvly8pyz8bs84', 'cmo0vtb1h000xvly8y4jlmnel', 'SALE', -1, 100, 99, 'Order TRX-20260416-62782', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-16 02:50:21.705');
INSERT INTO `inventory_logs` VALUES ('cmo0vz62o001avly8p154h1l6', 'cmo0vle3i000gvly8pyz8bs84', 'cmo0vz6260016vly8nt3nam81', 'SALE', -1, 99, 98, 'Order TRX-20260416-59134', 'cmo0vf9300005vly82iwy3u7j', '2026-04-16 02:54:55.104');
INSERT INTO `inventory_logs` VALUES ('cmo0yi2dj001hvly8n2fracqo', 'cmo0vle3i000gvly8pyz8bs84', 'cmo0yi2at001dvly8blekz39v', 'SALE', -1, 98, 97, 'Order TRX-20260416-02823', 'cmo0vf9300005vly82iwy3u7j', '2026-04-16 04:05:36.008');
INSERT INTO `inventory_logs` VALUES ('cmo5uwd8q000pvlg87jnx4o1w', 'cmo0vle3i000gvly8pyz8bs84', 'cmo5uwd80000lvlg8hsalc5vq', 'SALE', -1, 97, 96, 'Order TRX-20260419-44285', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-19 14:23:35.690');
INSERT INTO `inventory_logs` VALUES ('cmo7z4ndk0006vl84cuc69dlr', 'cmo0vle3i000gvly8pyz8bs84', 'cmo7z4nc80002vl84bic1o6b2', 'SALE', -1, 96, 95, 'Order TRX-20260421-54395', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-21 01:57:32.889');
INSERT INTO `inventory_logs` VALUES ('cmo9rdve60006vl14i5emhs9u', 'cmo0vle3i000gvly8pyz8bs84', 'cmo9rdvch0002vl14xuae93ck', 'SALE', -1, 95, 94, 'Order TRX-20260422-66652', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-22 07:56:18.606');
INSERT INTO `inventory_logs` VALUES ('cmo9rgw13000dvl14sw9fnzne', 'cmo0vle3i000gvly8pyz8bs84', 'cmo9rgvzv0009vl14vw6e6656', 'SALE', -1, 94, 93, 'Order TRX-20260422-91859', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-22 07:58:39.399');
INSERT INTO `inventory_logs` VALUES ('cmoa2fx020006vlww4rk273hn', 'cmo0vle3i000gvly8pyz8bs84', 'cmoa2fwye0002vlww9h46xhli', 'SALE', -1, 93, 92, 'Order TRX-20260422-70722', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-22 13:05:49.778');
INSERT INTO `inventory_logs` VALUES ('cmoawvpm70006vlz0rf2ayl5c', 'cmo0vle3i000gvly8pyz8bs84', 'cmoawvpk10002vlz0it66l5ww', 'SALE', -1, 92, 91, 'Order TRX-20260423-72139', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-23 03:17:55.183');
INSERT INTO `inventory_logs` VALUES ('cmoax8c5p0008vllcadp7z68x', 'cmo0vm6hc000jvly867bnv66o', 'cmoax8c4j0004vllcsfb0euwp', 'SALE', -1, 100, 99, 'Order TRX-20260423-19067', 'cmo0vgv0t0009vly8vy7tw0t8', '2026-04-23 03:27:44.269');
INSERT INTO `inventory_logs` VALUES ('cmoaxbl26000fvllcp7va4107', 'cmo0vm6hc000jvly867bnv66o', 'cmoaxbl1o000bvllc8v66hc2n', 'SALE', -1, 99, 98, 'Order TRX-20260423-27000', 'cmo0vgv0t0009vly8vy7tw0t8', '2026-04-23 03:30:15.775');
INSERT INTO `inventory_logs` VALUES ('cmoaxq7ls0006vlmgllcbz7v9', 'cmo0vm6hc000jvly867bnv66o', 'cmoaxq7kh0002vlmgwkfc3lkh', 'SALE', -4, 98, 94, 'Order TRX-20260423-44235', 'cmo0vgv0t0009vly8vy7tw0t8', '2026-04-23 03:41:38.176');
INSERT INTO `inventory_logs` VALUES ('cmoaxvtgs000fvlmgutnygarv', 'cmo0vmwm3000mvly83xayc497', 'cmoaxvtg6000bvlmg9ydsy79m', 'SALE', -1, 100, 99, 'Order TRX-20260423-29204', 'cmo0vidxk000dvly8b1kc05z9', '2026-04-23 03:45:59.788');
INSERT INTO `inventory_logs` VALUES ('cmoaxx1nt000mvlmgf2xel7yh', 'cmo0vmwm3000mvly83xayc497', 'cmoaxx1li000ivlmg29gpiu7i', 'SALE', -1, 99, 98, 'Order TRX-20260423-36145', 'cmo0vidxk000dvly8b1kc05z9', '2026-04-23 03:46:57.065');
INSERT INTO `inventory_logs` VALUES ('cmoc9t9m30006vli4xjbu4t5k', 'cmo0vle3i000gvly8pyz8bs84', 'cmoc9t9it0002vli4hihkt38l', 'SALE', -1, 91, 90, 'Order TRX-20260424-41583', 'cmo0vf9300005vly82iwy3u7j', '2026-04-24 02:07:42.315');
INSERT INTO `inventory_logs` VALUES ('cmpbdr2640007vl5sl2uf0n4g', 'cmo0vle3i000gvly8pyz8bs84', 'cmpbdr25l0003vl5smtwx5tyf', 'SALE', -1, 90, 89, 'Order TRX-20260518-46978', 'cmo0vg1f90007vly87m1b0f2l', '2026-05-18 15:49:53.980');

-- ----------------------------
-- Table structure for packages
-- ----------------------------
DROP TABLE IF EXISTS `packages`;
CREATE TABLE `packages`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `basePrice` decimal(10, 2) NOT NULL,
  `photoCount` int NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `specifications` json NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `imageUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `packages_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of packages
-- ----------------------------
INSERT INTO `packages` VALUES ('cmnztj7nx0000vlzkqgxhrp42', 'CONTOH', 'PKG001', 'paket contoh', 35000.00, 1, 1, NULL, '2026-04-15 08:58:45.234', '2026-04-15 08:58:45.234', '/api/images/1776243509147-hqdegcffj8c.jpg');
INSERT INTO `packages` VALUES ('cmnztjxgl0001vlzk1xu6nlyc', 'CONTOH2', 'PKG002', 'paket contoh 2', 50000.00, 1, 1, NULL, '2026-04-15 08:59:18.693', '2026-04-15 08:59:18.693', '/api/images/1776243553465-fe15z744kxe.jpg');
INSERT INTO `packages` VALUES ('cmo0vo0t9000pvly8o1ta3oul', 'CONTOH3', 'PKG003', 'paket contoh 3 ', 40000.00, 1, 1, NULL, '2026-04-16 02:46:15.069', '2026-04-16 02:46:15.069', '/api/images/1776307569195-6fif4r23kd.jpg');
INSERT INTO `packages` VALUES ('cmo0vpvuf000qvly8bdpjj3p2', 'CONTOH4', 'PKG004', 'paket contoh 4', 40000.00, 1, 1, NULL, '2026-04-16 02:47:41.944', '2026-04-16 02:47:41.944', '/api/images/1776307655365-d090t1rqv99.jpg');
INSERT INTO `packages` VALUES ('cmo0vqqmi000rvly8aemh92zn', 'CONTOH5', 'PKG005', 'paket contoh 5', 45000.00, 1, 1, NULL, '2026-04-16 02:48:21.835', '2026-04-16 02:48:21.835', '/api/images/1776307693092-czxkqbhfnwh.jpg');
INSERT INTO `packages` VALUES ('cmo0vrej5000svly8hzo5lxxs', 'CONTOH6', 'PKG006', 'paket contoh 6', 45000.00, 1, 1, NULL, '2026-04-16 02:48:52.817', '2026-04-16 02:48:52.817', '/api/images/1776307726481-cyvpq3syv1.jpg');

-- ----------------------------
-- Table structure for promos
-- ----------------------------
DROP TABLE IF EXISTS `promos`;
CREATE TABLE `promos`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `type` enum('PERCENTAGE','FIXED_AMOUNT','FREE_ITEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(10, 2) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `minPurchase` decimal(10, 2) NULL DEFAULT NULL,
  `maxDiscount` decimal(10, 2) NULL DEFAULT NULL,
  `usageLimit` int NULL DEFAULT NULL,
  `usageCount` int NOT NULL DEFAULT 0,
  `applicableBranches` json NULL,
  `applicablePackages` json NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `promos_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of promos
-- ----------------------------
INSERT INTO `promos` VALUES ('cmpbdpefj0000vl5s35jjux0h', 'DISKON5000', 'Potongan 5000', NULL, 'FIXED_AMOUNT', 5000.00, 1, NULL, NULL, NULL, 0, NULL, NULL, '2026-05-18 15:48:36.518', '2026-05-18 15:49:39.351');

-- ----------------------------
-- Table structure for shifts
-- ----------------------------
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `shiftNo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `branchId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cashierId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NULL DEFAULT NULL,
  `openingBalance` decimal(10, 2) NOT NULL,
  `closingBalance` decimal(10, 2) NULL DEFAULT NULL,
  `expectedBalance` decimal(10, 2) NULL DEFAULT NULL,
  `difference` decimal(10, 2) NULL DEFAULT NULL,
  `totalTransactions` int NOT NULL DEFAULT 0,
  `totalSales` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `cashSales` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `cardSales` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `qrisSales` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `otherSales` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `shifts_shiftNo_key`(`shiftNo` ASC) USING BTREE,
  INDEX `shifts_cashierId_idx`(`cashierId` ASC) USING BTREE,
  INDEX `shifts_startTime_idx`(`startTime` ASC) USING BTREE,
  INDEX `shifts_branchId_idx`(`branchId` ASC) USING BTREE,
  CONSTRAINT `shifts_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `shifts_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shifts
-- ----------------------------
INSERT INTO `shifts` VALUES ('cmo0vrxjm000uvly8iyozhy9a', 'SHF-20260416-182', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-16 02:49:17.434', '2026-04-16 02:53:01.982', 50000.00, 90000.00, 95000.00, -5000.00, 1, 45000.00, 45000.00, 0.00, 0.00, 0.00, NULL, '2026-04-16 02:49:17.436', '2026-04-16 02:53:01.984');
INSERT INTO `shifts` VALUES ('cmo0vynkj0013vly8xqmggsro', 'SHF-20260416-834', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vf9300005vly82iwy3u7j', '2026-04-16 02:54:31.121', NULL, 50000.00, NULL, NULL, NULL, 3, 135000.00, 0.00, 0.00, 135000.00, 0.00, NULL, '2026-04-16 02:54:31.124', '2026-04-24 02:07:42.383');
INSERT INTO `shifts` VALUES ('cmo5u285d0001vlg88en0hh63', 'SHF-20260419-536', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', '2026-04-19 14:00:09.333', NULL, 500000.00, NULL, NULL, NULL, 11, 485000.00, 45000.00, 0.00, 440000.00, 0.00, NULL, '2026-04-19 14:00:09.342', '2026-05-18 15:49:54.002');
INSERT INTO `shifts` VALUES ('cmoax7zuq0001vllcsjqilpgr', 'SHF-20260423-505', 'cmo0vdgeb0002vly80ude7pft', 'cmo0vgv0t0009vly8vy7tw0t8', '2026-04-23 03:27:28.262', NULL, 60000.00, NULL, NULL, NULL, 3, 125000.00, 125000.00, 0.00, 0.00, 0.00, NULL, '2026-04-23 03:27:28.265', '2026-04-23 03:41:38.199');
INSERT INTO `shifts` VALUES ('cmoaxvj8c0008vlmgoz5vdq31', 'SHF-20260423-166', 'cmo0vb0bg0000vly8yiz0b5f6', 'cmo0vidxk000dvly8b1kc05z9', '2026-04-23 03:45:46.523', NULL, 56666.00, NULL, NULL, NULL, 2, 90000.00, 0.00, 0.00, 90000.00, 0.00, NULL, '2026-04-23 03:45:46.524', '2026-04-23 03:46:57.092');

-- ----------------------------
-- Table structure for templates
-- ----------------------------
DROP TABLE IF EXISTS `templates`;
CREATE TABLE `templates`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnailUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isPopular` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `templates_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of templates
-- ----------------------------

-- ----------------------------
-- Table structure for transaction_items
-- ----------------------------
DROP TABLE IF EXISTS `transaction_items`;
CREATE TABLE `transaction_items`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `packageId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `templateId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `addOnId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `itemName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemType` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `price` decimal(10, 2) NOT NULL,
  `subtotal` decimal(10, 2) NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `transaction_items_transactionId_idx`(`transactionId` ASC) USING BTREE,
  INDEX `transaction_items_packageId_idx`(`packageId` ASC) USING BTREE,
  INDEX `transaction_items_templateId_idx`(`templateId` ASC) USING BTREE,
  INDEX `transaction_items_addOnId_idx`(`addOnId` ASC) USING BTREE,
  CONSTRAINT `transaction_items_addOnId_fkey` FOREIGN KEY (`addOnId`) REFERENCES `add_ons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transaction_items_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transaction_items_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transaction_items_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of transaction_items
-- ----------------------------
INSERT INTO `transaction_items` VALUES ('cmo0vtb3i000zvly8w42lmcq6', 'cmo0vtb1h000xvly8y4jlmnel', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-16 02:50:21.605');
INSERT INTO `transaction_items` VALUES ('cmo0vz6260018vly8133efwb4', 'cmo0vz6260016vly8nt3nam81', 'cmnztjxgl0001vlzk1xu6nlyc', NULL, NULL, 'CONTOH2', 'package', 1, 50000.00, 50000.00, NULL, '2026-04-16 02:54:55.086');
INSERT INTO `transaction_items` VALUES ('cmo0yi2be001fvly89srdnx7n', 'cmo0yi2at001dvly8blekz39v', 'cmo0vqqmi000rvly8aemh92zn', NULL, NULL, 'CONTOH5', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-16 04:05:35.885');
INSERT INTO `transaction_items` VALUES ('cmo5u4tp10006vlg8iddj56v2', 'cmo5u4tod0004vlg8krc7oyf0', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-19 14:02:10.612');
INSERT INTO `transaction_items` VALUES ('cmo5u8ssc000avlg8dnaukddw', 'cmo5u8ssb0008vlg868ijsgg7', 'cmo0vqqmi000rvly8aemh92zn', NULL, NULL, 'CONTOH5', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-19 14:05:16.091');
INSERT INTO `transaction_items` VALUES ('cmo5ue8sv000ivlg8lo8568lb', 'cmo5ue8sv000gvlg8wl15z31f', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-19 14:09:30.127');
INSERT INTO `transaction_items` VALUES ('cmo5uwd80000nvlg8nie59bwh', 'cmo5uwd80000lvlg8hsalc5vq', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-19 14:23:35.664');
INSERT INTO `transaction_items` VALUES ('cmo5uyqgb000tvlg8i2pyq0ko', 'cmo5uyqga000rvlg8ynuqjd9q', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-19 14:25:26.122');
INSERT INTO `transaction_items` VALUES ('cmo7z4ncn0004vl84weluqwrs', 'cmo7z4nc80002vl84bic1o6b2', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-21 01:57:32.836');
INSERT INTO `transaction_items` VALUES ('cmo9rdvco0004vl14hf135zbt', 'cmo9rdvch0002vl14xuae93ck', 'cmo0vpvuf000qvly8bdpjj3p2', NULL, NULL, 'CONTOH4', 'package', 1, 40000.00, 40000.00, NULL, '2026-04-22 07:56:18.545');
INSERT INTO `transaction_items` VALUES ('cmo9rgvzv000bvl14k3rntktj', 'cmo9rgvzv0009vl14vw6e6656', 'cmo0vpvuf000qvly8bdpjj3p2', NULL, NULL, 'CONTOH4', 'package', 1, 40000.00, 40000.00, NULL, '2026-04-22 07:58:39.355');
INSERT INTO `transaction_items` VALUES ('cmoa2fwyu0004vlwwglgudg8t', 'cmoa2fwye0002vlww9h46xhli', 'cmo0vqqmi000rvly8aemh92zn', NULL, NULL, 'CONTOH5', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-22 13:05:49.718');
INSERT INTO `transaction_items` VALUES ('cmoawvpk80004vlz0bqwpkagv', 'cmoawvpk10002vlz0it66l5ww', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-23 03:17:55.105');
INSERT INTO `transaction_items` VALUES ('cmoax8c4r0006vllczfwtuecp', 'cmoax8c4j0004vllcsfb0euwp', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-23 03:27:44.227');
INSERT INTO `transaction_items` VALUES ('cmoaxbl1o000dvllcifi03jdi', 'cmoaxbl1o000bvllc8v66hc2n', 'cmo0vpvuf000qvly8bdpjj3p2', NULL, NULL, 'CONTOH4', 'package', 1, 40000.00, 40000.00, NULL, '2026-04-23 03:30:15.756');
INSERT INTO `transaction_items` VALUES ('cmoaxq7ki0004vlmg1afokcj2', 'cmoaxq7kh0002vlmgwkfc3lkh', 'cmo0vpvuf000qvly8bdpjj3p2', NULL, NULL, 'CONTOH4', 'package', 1, 40000.00, 40000.00, NULL, '2026-04-23 03:41:38.129');
INSERT INTO `transaction_items` VALUES ('cmoaxvtg6000dvlmg63lr54ot', 'cmoaxvtg6000bvlmg9ydsy79m', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-23 03:45:59.766');
INSERT INTO `transaction_items` VALUES ('cmoaxx1li000kvlmgidw6uqa9', 'cmoaxx1li000ivlmg29gpiu7i', 'cmo0vqqmi000rvly8aemh92zn', NULL, NULL, 'CONTOH5', 'package', 1, 45000.00, 45000.00, NULL, '2026-04-23 03:46:56.982');
INSERT INTO `transaction_items` VALUES ('cmoc9t9iu0004vli48p3cts5j', 'cmoc9t9it0002vli4hihkt38l', 'cmo0vpvuf000qvly8bdpjj3p2', NULL, NULL, 'CONTOH4', 'package', 1, 40000.00, 40000.00, NULL, '2026-04-24 02:07:42.196');
INSERT INTO `transaction_items` VALUES ('cmpbdr25l0005vl5sxglq5ste', 'cmpbdr25l0003vl5smtwx5tyf', 'cmo0vrej5000svly8hzo5lxxs', NULL, NULL, 'CONTOH6', 'package', 1, 45000.00, 45000.00, NULL, '2026-05-18 15:49:53.962');

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionNo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `branchId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cashierId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `shiftId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subtotal` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `total` decimal(10, 2) NOT NULL,
  `paymentMethod` enum('CASH','DEBIT_CARD','CREDIT_CARD','QRIS','TRANSFER','E_WALLET') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentStatus` enum('PENDING','PAID','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paidAmount` decimal(10, 2) NOT NULL,
  `changeAmount` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `status` enum('PENDING','PROCESSING','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `promoCode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `promoDiscount` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cancelReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cancelledBy` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `cancelledAt` datetime(3) NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `refundReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `refundedAt` datetime(3) NULL DEFAULT NULL,
  `isPrinted` tinyint(1) NOT NULL DEFAULT 0,
  `queueNumber` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `transactions_transactionNo_key`(`transactionNo` ASC) USING BTREE,
  INDEX `transactions_branchId_idx`(`branchId` ASC) USING BTREE,
  INDEX `transactions_cashierId_idx`(`cashierId` ASC) USING BTREE,
  INDEX `transactions_customerId_idx`(`customerId` ASC) USING BTREE,
  INDEX `transactions_shiftId_idx`(`shiftId` ASC) USING BTREE,
  INDEX `transactions_transactionNo_idx`(`transactionNo` ASC) USING BTREE,
  INDEX `transactions_createdAt_idx`(`createdAt` ASC) USING BTREE,
  CONSTRAINT `transactions_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transactions_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transactions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `shifts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of transactions
-- ----------------------------
INSERT INTO `transactions` VALUES ('cmo0vtb1h000xvly8y4jlmnel', 'TRX-20260416-62782', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo0vtb08000vvly82xrtopnn', 'cmo0vrxjm000uvly8iyozhy9a', 45000.00, 0.00, 0.00, 45000.00, 'CASH', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-16 02:50:21.605', '2026-04-16 02:50:21.605', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo0vz6260016vly8nt3nam81', 'TRX-20260416-59134', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vf9300005vly82iwy3u7j', 'cmo0vz61j0014vly8ujxcqblr', 'cmo0vynkj0013vly8xqmggsro', 50000.00, 0.00, 0.00, 50000.00, 'QRIS', 'PAID', 50000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-16 02:54:55.086', '2026-04-16 02:54:55.086', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo0yi2at001dvly8blekz39v', 'TRX-20260416-02823', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vf9300005vly82iwy3u7j', 'cmo0yi25l001bvly8bqx1hc2a', 'cmo0vynkj0013vly8xqmggsro', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'REFUNDED', 45000.00, 0.00, 'CANCELLED', NULL, 0.00, NULL, NULL, 'cmnzt6f970003vlo028i7bzoz', '2026-04-17 07:43:22.272', '2026-04-16 04:05:35.885', '2026-04-17 07:43:22.273', 'tidak jadi', '2026-04-17 07:43:22.272', 0, NULL);
INSERT INTO `transactions` VALUES ('cmo5u4tod0004vlg8krc7oyf0', 'TRX-20260419-04535', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo5u4tl50002vlg8chy69mzg', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-19 14:02:10.612', '2026-04-19 14:02:10.612', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo5u8ssb0008vlg868ijsgg7', 'TRX-20260419-81909', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', NULL, 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-19 14:05:16.091', '2026-04-19 14:05:16.091', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo5ue8sv000gvlg8wl15z31f', 'TRX-20260419-80983', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo5ue8s4000evlg84xaouwoh', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-19 14:09:30.127', '2026-04-19 14:09:30.127', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo5uwd80000lvlg8hsalc5vq', 'TRX-20260419-44285', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo5ue8s4000evlg84xaouwoh', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-19 14:23:35.664', '2026-04-22 06:39:48.018', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmo5uyqga000rvlg8ynuqjd9q', 'TRX-20260419-54243', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', NULL, 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-19 14:25:26.122', '2026-04-19 14:25:26.122', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo7z4nc80002vl84bic1o6b2', 'TRX-20260421-54395', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo7z4n5c0000vl84t3hnxixr', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-21 01:57:32.836', '2026-04-21 08:12:00.710', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmo9rdvch0002vl14xuae93ck', 'TRX-20260422-66652', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo9rdv5v0000vl14hyscjw06', 'cmo5u285d0001vlg88en0hh63', 40000.00, 0.00, 0.00, 40000.00, 'QRIS', 'PAID', 40000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-22 07:56:18.545', '2026-04-22 07:56:18.545', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmo9rgvzv0009vl14vw6e6656', 'TRX-20260422-91859', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmo9rgvy10007vl14ah0d4sd0', 'cmo5u285d0001vlg88en0hh63', 40000.00, 0.00, 0.00, 40000.00, 'QRIS', 'PAID', 40000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-22 07:58:39.355', '2026-04-22 07:58:39.355', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmoa2fwye0002vlww9h46xhli', 'TRX-20260422-70722', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmoa2fwu50000vlww9k8xv0ao', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-22 13:05:49.718', '2026-04-22 13:05:49.718', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmoawvpk10002vlz0it66l5ww', 'TRX-20260423-72139', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmoawvpec0000vlz0r7bjarjj', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'CASH', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-23 03:17:55.105', '2026-04-23 03:17:55.105', NULL, NULL, 0, NULL);
INSERT INTO `transactions` VALUES ('cmoax8c4j0004vllcsfb0euwp', 'TRX-20260423-19067', 'cmo0vdgeb0002vly80ude7pft', 'cmo0vgv0t0009vly8vy7tw0t8', 'cmoax8c1o0002vllcw0xjrir8', 'cmoax7zuq0001vllcsjqilpgr', 45000.00, 0.00, 0.00, 45000.00, 'CASH', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-23 03:27:44.227', '2026-04-23 03:29:23.620', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmoaxbl1o000bvllc8v66hc2n', 'TRX-20260423-27000', 'cmo0vdgeb0002vly80ude7pft', 'cmo0vgv0t0009vly8vy7tw0t8', 'cmoaxbl120009vllcxywyjv4m', 'cmoax7zuq0001vllcsjqilpgr', 40000.00, 0.00, 0.00, 40000.00, 'CASH', 'PAID', 40000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-23 03:30:15.756', '2026-04-23 03:30:49.866', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmoaxq7kh0002vlmgwkfc3lkh', 'TRX-20260423-44235', 'cmo0vdgeb0002vly80ude7pft', 'cmo0vgv0t0009vly8vy7tw0t8', 'cmoaxq7h30000vlmgkgc2x3e2', 'cmoax7zuq0001vllcsjqilpgr', 40000.00, 0.00, 0.00, 40000.00, 'CASH', 'PAID', 40000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-23 03:41:38.129', '2026-04-23 03:45:25.820', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmoaxvtg6000bvlmg9ydsy79m', 'TRX-20260423-29204', 'cmo0vb0bg0000vly8yiz0b5f6', 'cmo0vidxk000dvly8b1kc05z9', 'cmoaxvtfr0009vlmglcvtat27', 'cmoaxvj8c0008vlmgoz5vdq31', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-23 03:45:59.766', '2026-04-23 03:46:21.127', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmoaxx1li000ivlmg29gpiu7i', 'TRX-20260423-36145', 'cmo0vb0bg0000vly8yiz0b5f6', 'cmo0vidxk000dvly8b1kc05z9', 'cmoaxx1l2000gvlmgavsgex6z', 'cmoaxvj8c0008vlmgoz5vdq31', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-23 03:46:56.982', '2026-04-23 03:48:53.560', NULL, NULL, 1, NULL);
INSERT INTO `transactions` VALUES ('cmoc9t9it0002vli4hihkt38l', 'TRX-20260424-41583', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vf9300005vly82iwy3u7j', 'cmoc9t9cb0000vli4czft7s1u', 'cmo0vynkj0013vly8xqmggsro', 40000.00, 0.00, 0.00, 40000.00, 'QRIS', 'PAID', 40000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-04-24 02:07:42.196', '2026-05-18 01:32:14.031', NULL, NULL, 1, '001');
INSERT INTO `transactions` VALUES ('cmpbdr25l0003vl5smtwx5tyf', 'TRX-20260518-46978', 'cmo0vecrc0003vly8k1tcz338', 'cmo0vg1f90007vly87m1b0f2l', 'cmpbdr22x0001vl5sci455da5', 'cmo5u285d0001vlg88en0hh63', 45000.00, 0.00, 0.00, 45000.00, 'QRIS', 'PAID', 45000.00, 0.00, 'COMPLETED', NULL, 0.00, NULL, NULL, NULL, NULL, '2026-05-18 15:49:53.962', '2026-05-18 15:49:53.962', NULL, NULL, 0, '001');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` datetime(3) NULL DEFAULT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` enum('SUPER_ADMIN','CASHIER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASHIER',
  `branchId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `activeSessionToken` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sessionTokenVersion` int NOT NULL DEFAULT 0,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_key`(`email` ASC) USING BTREE,
  UNIQUE INDEX `users_username_key`(`username` ASC) USING BTREE,
  UNIQUE INDEX `users_activeSessionToken_key`(`activeSessionToken` ASC) USING BTREE,
  INDEX `users_branchId_idx`(`branchId` ASC) USING BTREE,
  CONSTRAINT `users_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('cmnzt6f970003vlo028i7bzoz', 'Super Admin', 'admin@photobox.com', NULL, '$2b$10$RLOEDBFt13XojX8Qswffz.hsC.lmVUjk/fWD.kg9quqB9KPisgvYG', NULL, 'SUPER_ADMIN', 'cmliw7iwk0000vl3ga1yddgl9', '2026-04-15 08:48:48.556', '2026-05-18 15:47:49.900', 'be908f3e-c0df-42c7-9ca1-86d2d5415287', 38, 'superadmin');
INSERT INTO `users` VALUES ('cmo0vf9300005vly82iwy3u7j', 'Abil Ikhsan', 'abil@gmail.com', NULL, '$2b$10$0MbkBzSeYwpJ4ODZVjfdIOpgyiPOw..J7H2pecncTuL0z7cRcAHIK', NULL, 'CASHIER', 'cmo0vecrc0003vly8k1tcz338', '2026-04-16 02:39:25.884', '2026-04-24 02:03:46.304', '8fe14e31-fc74-4805-a4df-aeb0353f7693', 5, 'abil');
INSERT INTO `users` VALUES ('cmo0vg1f90007vly87m1b0f2l', 'Nadivta Salsabila', 'nadivta@gmail.com', NULL, '$2b$10$GdsV9VZOyiKg5JRhIr5XUugUa5nCsXXfJk8fUeqzw0s3eQdtDAEIW', NULL, 'CASHIER', 'cmo0vecrc0003vly8k1tcz338', '2026-04-16 02:40:02.613', '2026-05-18 15:48:54.865', '03a10f3a-e5d7-4502-9645-435914eb0491', 23, 'nadivta');
INSERT INTO `users` VALUES ('cmo0vgv0t0009vly8vy7tw0t8', 'Maulana Akram', 'maulana@gmail.com', NULL, '$2b$10$AS3TgiEAQ.0xOeVP447UsOr6HqT6yBJhpSxCG41fe8J4XO8IOxAbm', NULL, 'CASHIER', 'cmo0vdgeb0002vly80ude7pft', '2026-04-16 02:40:40.973', '2026-04-23 03:40:57.604', '5d3fcd2d-57b7-4a73-8783-9510889a0247', 3, 'maulana');
INSERT INTO `users` VALUES ('cmo0vhn5e000bvly84o8912v2', 'Mia Hermiyah', 'mia@gmail.com', NULL, '$2b$10$UF8Ok6sKfLq2OOMj6H.oVuMVcRTXAqMYKMNOwJtRB3/iSLA0OxE0i', NULL, 'CASHIER', 'cmo0vdgeb0002vly80ude7pft', '2026-04-16 02:41:17.426', '2026-04-16 02:41:17.426', NULL, 0, 'miaherimyah');
INSERT INTO `users` VALUES ('cmo0vidxk000dvly8b1kc05z9', 'Putra Nugraha', 'putra@gmail.com', NULL, '$2b$10$gxmWrEdz8azgA93K2yFkE.Q/Q4Gxc/6lJygT2609ZSUNNEKN9wKeq', NULL, 'CASHIER', 'cmo0vb0bg0000vly8yiz0b5f6', '2026-04-16 02:41:52.137', '2026-04-23 03:45:41.326', 'd3ca882a-11bf-4fab-ac47-4834e3a0f174', 4, 'putra');
INSERT INTO `users` VALUES ('cmo0vj77l000fvly8ajupyekh', 'Malik Ibrahim', 'malik@gmail.com', NULL, '$2b$10$jqbDHQ03xMHCdk7x3O.Ry.9E7.XF3xEw/Fwfrpbx6bRzoViNbQytu', NULL, 'CASHIER', 'cmo0vb0bg0000vly8yiz0b5f6', '2026-04-16 02:42:30.081', '2026-04-16 02:42:30.081', NULL, 0, 'malik');

SET FOREIGN_KEY_CHECKS = 1;
