/*
  Warnings:

  - The values [canceled] on the enum `friend_requests_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `friend_requests` MODIFY `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending';
