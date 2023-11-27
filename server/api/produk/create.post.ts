import prisma from "../../../prisma";

interface ItemTypes {
  nama_produk: string;
  harga: number;
  kategori_id: number;
  status_id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { nama_produk, harga, kategori_id, status_id } = await readBody<ItemTypes>(event)
    const result = await prisma.produk.create({
      data: {
        nama_produk,
        harga: Number(harga),
        kategori_id,
        status_id
      },
      include: {
        status: true,
        kategori: true
      }
    })
    return result
  } catch (error) {
    setResponseStatus(event, 404, 'Data Not Found')
    return { error: true }
  }
})