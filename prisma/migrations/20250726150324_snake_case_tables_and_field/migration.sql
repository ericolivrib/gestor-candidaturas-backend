/*
  Warnings:

  - You are about to drop the `ApplicationStage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApplicationStage" DROP CONSTRAINT "ApplicationStage_jobApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";

-- DropTable
DROP TABLE "ApplicationStage";

-- DropTable
DROP TABLE "JobApplication";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_application" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "curriculum_path" TEXT,
    "job_title" TEXT NOT NULL,
    "company_name" TEXT,
    "tags" TEXT[],
    "url" TEXT,
    "status" "Status" NOT NULL,

    CONSTRAINT "job_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_stage" (
    "id" SERIAL NOT NULL,
    "job_application_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "feedback" TEXT,
    "scheduled_at" TIMESTAMP(3),

    CONSTRAINT "application_stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_stage" ADD CONSTRAINT "application_stage_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
