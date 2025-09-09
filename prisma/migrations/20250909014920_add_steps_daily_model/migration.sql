-- CreateTable
CREATE TABLE `steps_daily` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `stepDate` DATE NOT NULL,
    `stepCount` INTEGER NOT NULL DEFAULT 0,
    `sourceHint` VARCHAR(128) NULL,
    `lastSyncedAt` DATETIME(3) NOT NULL,

    INDEX `ix_user_date`(`userId`, `stepDate`),
    UNIQUE INDEX `steps_daily_userId_stepDate_key`(`userId`, `stepDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `steps_daily` ADD CONSTRAINT `steps_daily_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
