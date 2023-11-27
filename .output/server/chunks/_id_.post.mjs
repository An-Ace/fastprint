import { d as defineEventHandler, r as readBody, s as setResponseStatus } from './nitro/node-server.mjs';
import { p as prisma } from './index.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import '@prisma/client';

const _id__post = defineEventHandler(async (event) => {
  try {
    const id_produk = parseInt(event.context.params.id);
    const { nama_produk, harga, kategori_id, status_id } = await readBody(event);
    const result = await prisma.produk.update({
      where: {
        id_produk
      },
      data: {
        nama_produk,
        harga,
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

export { _id__post as default };
//# sourceMappingURL=_id_.post.mjs.map
