-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "assignedAdminId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
