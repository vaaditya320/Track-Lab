-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PARTIAL', 'SUBMITTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regId" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teamMembers" TEXT NOT NULL,
    "components" TEXT NOT NULL,
    "summary" TEXT,
    "projectPhoto" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PARTIAL',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_regId_key" ON "User"("regId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
