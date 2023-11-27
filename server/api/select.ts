import prisma from "../../prisma";

export default defineEventHandler(async (event) => {

  const kategori = await prisma.kategori.findMany()
  const status = await prisma.status.findMany()

  var kategoriKey: { [x: string]: string } = {}
  var statusKey: { [x: string]: string } = {}

  kategori.forEach(item => { kategoriKey[item.id_kategori] = item.nama_kategori })
  status.forEach(item => { statusKey[item.id_status] = item.nama_status })

  return {
    kategori: kategori.map(item => ({ title: item.nama_kategori, value: item.id_kategori })),
    status: status.map(item => ({ title: item.nama_status, value: item.id_status })),
    kategoriKey,
    statusKey
  }
})
