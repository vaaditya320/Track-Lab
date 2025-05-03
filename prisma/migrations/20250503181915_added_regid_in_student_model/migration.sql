/*
  Warnings:

  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[regId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `regId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_name_key";

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "id",
ADD COLUMN     "regId" TEXT NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("regId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_regId_key" ON "Student"("regId");
