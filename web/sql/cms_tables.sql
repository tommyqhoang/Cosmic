-- Auto-generated from Prisma migration requirements for HeavenMS web CMS tables
-- These are the CMS-specific tables needed alongside the existing v83 game tables.

CREATE TABLE IF NOT EXISTS `cms_posts` (
  `id`       INT AUTO_INCREMENT PRIMARY KEY,
  `title`    VARCHAR(200) NOT NULL,
  `content`  TEXT NOT NULL,
  `category` VARCHAR(20) NOT NULL,
  `authorId` INT NOT NULL,
  `pinned`   BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `cms_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_downloads` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `name`         VARCHAR(100) NOT NULL,
  `description`  TEXT,
  `url`          VARCHAR(500) NOT NULL,
  `category`     VARCHAR(20) NOT NULL,
  `displayOrder` INT NOT NULL DEFAULT 0,
  `createdAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_smega` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `player`     VARCHAR(13) NOT NULL,
  `channel`    INT NOT NULL DEFAULT 0,
  `type`       VARCHAR(10) NOT NULL,
  `message`    TEXT NOT NULL,
  `item_id`    INT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cms_smega_createdAt` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_subscribers` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `email`            VARCHAR(254) NOT NULL UNIQUE,
  `token`            VARCHAR(64) NOT NULL UNIQUE,
  `active`           BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at`  DATETIME,
  INDEX `idx_cms_subscribers_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_settings` (
  `key`        VARCHAR(64) PRIMARY KEY,
  `value`      TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bit_votingrecords` (
  `account` VARCHAR(13) PRIMARY KEY,
  `date`    INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compatibility: if bosslog_daily / bosslog_weekly are missing, create them
-- (Cosmic Liquibase already creates these; the statements will safely fail if they exist)
-- CREATE TABLE IF NOT EXISTS `bosslog_daily` (...);
-- CREATE TABLE IF NOT EXISTS `bosslog_weekly` (...);

-- Ensure `reborns` column exists on `characters` so the CMS aggregate queries don't break
-- Liquibase in Cosmic already added it; this is a no-op if present.
-- ALTER TABLE `characters` ADD COLUMN IF NOT EXISTS `reborns` INT NOT NULL DEFAULT 0;
