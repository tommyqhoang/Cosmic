-- Creates the key/value settings table backing admin-editable site settings
-- (social media links, etc.). Run manually against the prod DB — never
-- `prisma db push` (the schema is only a partial view of the v83 game DB; a push
-- would DROP game columns/indexes). The website reads/writes rows here; an absent
-- or empty value means the setting is unset. Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS `cms_settings` (
    `key` VARCHAR(64) NOT NULL,
    `value` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
