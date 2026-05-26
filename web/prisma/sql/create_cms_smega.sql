-- Creates the smega (megaphone) broadcast log the website mirrors from in-game.
-- Run manually against the prod DB — never `prisma db push` (the schema is only
-- a partial view of the v83 game DB; a push would DROP game columns/indexes).
-- The game server inserts rows here (see UseCashItemHandler); the website reads
-- the latest few. Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS `cms_smega` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player` VARCHAR(13) NOT NULL,
    `channel` INTEGER NOT NULL DEFAULT 0,
    `type` VARCHAR(10) NOT NULL,
    `message` TEXT NOT NULL,
    `item_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `cms_smega_created_at_idx` (`created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional housekeeping (run as a scheduled event or cron):
-- DELETE FROM `cms_smega` WHERE `created_at` < NOW() - INTERVAL 7 DAY;
