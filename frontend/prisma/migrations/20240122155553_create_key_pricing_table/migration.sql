-- CreateTable
CREATE TABLE "KeyPricing" (
    "shares" INTEGER NOT NULL,
    "buyPrice" BIGINT NOT NULL,
    "sellPrice" BIGINT NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyPricing_pkey" PRIMARY KEY ("id")
);
