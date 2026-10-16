-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Prediction_isDemo_publicationStatus_idx" ON "Prediction"("isDemo", "publicationStatus");
