-- AlterTable
ALTER TABLE "Task" ADD COLUMN "generatedFromTaskId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Task_generatedFromTaskId_key" ON "Task"("generatedFromTaskId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_generatedFromTaskId_fkey" FOREIGN KEY ("generatedFromTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
