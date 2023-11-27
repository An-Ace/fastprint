import { d as defineEventHandler, r as readBody, s as setResponseStatus } from './nitro/node-server.mjs';
import { p as prisma } from './index.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import '@prisma/client';

const create_post = defineEventHandler(async (event) => {
  try {
    const { nama_produk, harga, kategori_id, status_id } = await readBody(event);
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
    });
    return result;
  } catch (error) {
    setResponseStatus(event, 404, "Data Not Found");
    return { error: true };
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
