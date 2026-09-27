-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'PSU', 'STORAGE', 'CASE', 'COOLER');

-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('SHOPEE', 'TOKOPEDIA', 'MANUAL');

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CpuDetail" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "threads" INTEGER NOT NULL,
    "tdp" INTEGER NOT NULL,
    "hasGraphics" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CpuDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotherboardDetail" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "formFactor" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "maxMemory" INTEGER NOT NULL,

    CONSTRAINT "MotherboardDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductListing" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "sellerName" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CpuDetail_componentId_key" ON "CpuDetail"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "MotherboardDetail_componentId_key" ON "MotherboardDetail"("componentId");

-- CreateIndex
CREATE INDEX "ProductListing_componentId_idx" ON "ProductListing"("componentId");

-- AddForeignKey
ALTER TABLE "CpuDetail" ADD CONSTRAINT "CpuDetail_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotherboardDetail" ADD CONSTRAINT "MotherboardDetail_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListing" ADD CONSTRAINT "ProductListing_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
