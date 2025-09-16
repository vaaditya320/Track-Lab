-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Batch" ADD VALUE 'I1';
ALTER TYPE "Batch" ADD VALUE 'I2';
ALTER TYPE "Batch" ADD VALUE 'I3';

-- AlterEnum
ALTER TYPE "Branch" ADD VALUE 'EC';

-- AlterEnum
ALTER TYPE "Section" ADD VALUE 'I';
