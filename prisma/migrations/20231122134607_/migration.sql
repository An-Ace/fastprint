-- CreateTable
CREATE TABLE "Produk" (
    "id_produk" SERIAL NOT NULL,
    "nama_produk" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "Status" (
    "id_status" SERIAL NOT NULL,
    "nama_status" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id_status")
);

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "Kategori"("id_kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "Status"("id_status") ON DELETE RESTRICT ON UPDATE CASCADE;
