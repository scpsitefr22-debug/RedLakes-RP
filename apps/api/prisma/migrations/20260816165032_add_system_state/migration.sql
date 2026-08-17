-- CreateTable
CREATE TABLE "SystemState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "serverOpen" BOOLEAN NOT NULL DEFAULT false,
    "recruitmentOpen" BOOLEAN NOT NULL DEFAULT true,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemState_pkey" PRIMARY KEY ("id")
);
