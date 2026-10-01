-- CreateTable
CREATE TABLE "RamDetail" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "RamDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GpuDetail" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "tdp" INTEGER NOT NULL,

    CONSTRAINT "GpuDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsuDetail" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "wattage" INTEGER NOT NULL,
    "efficiency" TEXT NOT NULL,

    CONSTRAINT "PsuDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RamDetail_componentId_key" ON "RamDetail"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "GpuDetail_componentId_key" ON "GpuDetail"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "PsuDetail_componentId_key" ON "PsuDetail"("componentId");

-- AddForeignKey
ALTER TABLE "RamDetail" ADD CONSTRAINT "RamDetail_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpuDetail" ADD CONSTRAINT "GpuDetail_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsuDetail" ADD CONSTRAINT "PsuDetail_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
