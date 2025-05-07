-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('CS', 'CSR', 'CSAI', 'CSDS', 'AIDS', 'CSIOT');

-- CreateEnum
CREATE TYPE "Section" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');

-- CreateEnum
CREATE TYPE "Batch" AS ENUM ('A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'E1', 'E2', 'E3', 'F1', 'F2', 'F3', 'G1', 'G2', 'G3', 'H1', 'H2', 'H3');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "batch" "Batch",
ADD COLUMN     "branch" "Branch",
ADD COLUMN     "section" "Section";
