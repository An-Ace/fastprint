import prisma from "../../../../prisma";

export default defineEventHandler(async (event) => {
  try {
    const id_produk = parseInt(event.context.params!.id)
    const result = await prisma.produk.delete({
      where: { id_produk }
    })
    return result
  } catch (error) {
    setResponseStatus(event, 404, 'Data Not Found')
    return { error: true }
  }
})