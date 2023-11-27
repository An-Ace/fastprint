import { d as defineEventHandler, g as getQuery } from './nitro/node-server.mjs';
import { p as prisma } from './index.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import '@prisma/client';

const index_get = defineEventHandler(async (event) => {
  const { all } = getQuery(event);
  const result = await prisma.produk.findMany({
    where: {
      status: {
        nama_status: all == "true" ? void 0 : "bisa dijual"
      }
    },
    include: {
      status: true,
      kategori: true
    }
  });
  return result || [];
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
