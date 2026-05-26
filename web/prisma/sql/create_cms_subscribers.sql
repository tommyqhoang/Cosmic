-- Creates the newsletter subscriber table for the homepage email-subscription
-- feature. Run manually against the prod DB — never `prisma db push` (the schema
-- is only a partial view of the v83 game DB; a push would DROP game columns/indexes).
-- The website inserts a row when a visitor subscribes and flips `active` to 0 when
-- they unsubscribe. Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS `cms_subscribers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(254) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribed_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `cms_subscribers_email_key` (`email`),
    UNIQUE INDEX `cms_subscribers_token_key` (`token`),
    INDEX `cms_subscribers_active_idx` (`active`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
