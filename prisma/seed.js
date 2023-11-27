import { PrismaClient } from '@prisma/client'
import data from './data.json' assert { type: "json" };
const prisma = new PrismaClient()
async function main() {
  console.log('Seeding Data...');
  const status1 = await prisma.status.create({
    data: { nama_status: 'bisa dijual' }
  })
  const status2 = await prisma.status.create({
    data: { nama_status: 'tidak bisa dijual' }
  })
  const lists = sortData(data.data, 'kategori')
  lists.forEach(async list => {
    await prisma.kategori.create({
      data: {
        nama_kategori: list.name,
        produk: {
          createMany: {
            data: list.data.map(item => {
              console.log(`Insert Data: ${item.nama_produk}`)
              return {
                id_produk: parseInt(item.id_produk),
                nama_produk: item.nama_produk,
                harga: parseInt(item.harga),
                status_id: item.status === 'bisa dijual' ? status1.id_status : status2.id_status
              }
            })
          }
        }
      }
    })
  })
  await prisma.$queryRaw`SELECT setval('public."Produk_id_produk_seq"', 99, true);`
  await prisma.$queryRaw`SELECT setval('public."Kategori_id_kategori_seq"', 8, true);`
  await prisma.$queryRaw`SELECT setval('public."Status_id_status_seq"', 2, true);`
}
main()
.then(async () => {
  console.log('Seeding Success...');
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})

function sortData(data, columnName) {
  var sortedData = {};

  for (var i = 0; i < data.length; i++) {
      var object = data[i];

      if (Object.keys(sortedData).indexOf(object[columnName]) === -1) {
          sortedData[object[columnName]] = [];
      }

      sortedData[object[columnName]].push(object);
  }
  
  var result = Object.keys(sortedData).map(item => ({name: item, data: sortedData[item]}))
  return result;
}