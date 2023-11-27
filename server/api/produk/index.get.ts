import prisma from "../../../prisma";

export default defineEventHandler(async (event) => {
  const { all } = getQuery(event)
  const result = await prisma.produk.findMany({
    where: {
      status: {
        nama_status: all == 'true' ? undefined : 'bisa dijual'
      },
    },
    include: {
      status: true,
      kategori: true
    }
  })

  return result || []
})
