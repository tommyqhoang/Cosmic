-- Creates the CMS tables the web admin needs (posts + downloads).
-- These were defined in schema.prisma but never created in the prod DB,
-- because `prisma db push` is unsafe here: the schema is only a partial
-- view of the v83 game DB, so a full push would DROP game columns/indexes.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS `cms_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `cms_posts_authorId_idx` (`authorId`),
    CONSTRAINT `cms_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_downloads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `filename` VARCHAR(200) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
