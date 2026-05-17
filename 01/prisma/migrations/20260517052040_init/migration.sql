-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('admin', 'staff');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'staff',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" TEXT NOT NULL,
    "trade_name" TEXT NOT NULL,
    "generic_name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "expiry_date" TIMESTAMP(3),
    "laboratory_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(65,30) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "medicine_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "membership" TEXT NOT NULL DEFAULT 'bronze',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "medicines_trade_name_idx" ON "medicines"("trade_name");

-- CreateIndex
CREATE INDEX "medicines_generic_name_idx" ON "medicines"("generic_name");

-- CreateIndex
CREATE INDEX "medicines_laboratory_id_idx" ON "medicines"("laboratory_id");

-- CreateIndex
CREATE INDEX "medicines_category_id_idx" ON "medicines"("category_id");

-- CreateIndex
CREATE INDEX "sales_date_idx" ON "sales"("date");

-- CreateIndex
CREATE INDEX "sales_user_id_idx" ON "sales"("user_id");

-- CreateIndex
CREATE INDEX "sales_client_id_idx" ON "sales"("client_id");

-- CreateIndex
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items"("sale_id");

-- CreateIndex
CREATE INDEX "sale_items_medicine_id_idx" ON "sale_items"("medicine_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_document_number_key" ON "clients"("document_number");

-- CreateIndex
CREATE INDEX "clients_document_number_idx" ON "clients"("document_number");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_laboratory_id_fkey" FOREIGN KEY ("laboratory_id") REFERENCES "labs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
