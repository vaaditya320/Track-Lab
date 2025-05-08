/*
  Warnings:

  - You are about to drop the column `assignedAdminId` on the `Project` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEACHER';

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_assignedAdminId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "assignedAdminId",
ADD COLUMN     "assignedTeacherId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedTeacherId_fkey" FOREIGN KEY ("assignedTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
